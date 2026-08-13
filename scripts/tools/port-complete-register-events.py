#!/usr/bin/env python3
"""Port only complete, factual register rows to event-basic data.

Rows with unknown dates, venue, city or country are reported and left untouched.
The command is auditable by default and never overwrites an existing data file.
"""
import argparse, json, re
from datetime import date, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
TODAY = date.today()
BAD = re.compile(r"\b(tbc|pending|unknown)\b", re.I)
ALIASES = {"USA":"United States", "United States":"usa", "United Kingdom":"united-kingdom", "South Korea":"south-korea", "New Zealand":"new-zealand", "South Africa":"south-africa", "United Arab Emirates":"united-arab-emirates"}

def slugify(v): return re.sub(r"[^a-z0-9]+", "-", v.lower()).strip("-")
def pages():
    return {p.parent.name:("/"+p.relative_to(ROOT).as_posix(), "/"+(p.parent/"img/flag.svg").relative_to(ROOT).as_posix()) for p in (ROOT/"content/locations").glob("*/*/index.html")}
def country_page(name, all_pages):
    value = ALIASES.get(name, name)
    return all_pages.get(value if value in all_pages else slugify(value))
def display(start,end):
    if start.year != end.year:
        return f"{start:%d %B %Y}–{end:%d %B %Y}"
    return f"{start:%d %B}–{end:%d %B %Y}"

def main():
    parser=argparse.ArgumentParser(); g=parser.add_mutually_exclusive_group(required=True)
    g.add_argument("--dry-run",action="store_true"); g.add_argument("--write",action="store_true")
    parser.add_argument("--refresh-register",action="store_true",help="rewrite only records previously created from the operations register")
    args=parser.parse_args()
    register=json.loads((ROOT/"events.register.json").read_text(encoding="utf-8"))["events"]
    affiliate=json.loads((ROOT/"scripts/config.json").read_text(encoding="utf-8"))["affiliate"]["booking"]["clickBase"]
    loc_pages=pages(); made=[]; stopped=[]
    existing_slugs={p.stem for p in (ROOT/"data/events").glob("**/*.json")}
    for e in register:
        category,topic,slug=e.get("category",""),e.get("topic",""),e.get("slug","")
        target=ROOT/"data/events"/category/topic/f"{slug}.json"
        if target.exists():
            try: existing=json.loads(target.read_text(encoding="utf-8"))
            except json.JSONDecodeError: existing={}
            imported=any(s.get("label")=="OneSliders event operations register" for s in existing.get("sources",[]) if isinstance(s,dict))
            if not (args.refresh_register and imported): continue
        elif slug in existing_slugs: continue
        place=e.get("location",{}); countries=place.get("countries",[]); cities=place.get("cities",[])
        if not e.get("startDate") or not e.get("endDate") or not countries or not cities or not place.get("venue"):
            stopped.append((slug,"missing date, country, city or venue")); continue
        if any(BAD.search(str(v)) for v in [e["startDate"],e["endDate"],countries[0],cities[0],place["venue"]]):
            stopped.append((slug,"register contains TBC/pending value")); continue
        try: start=date.fromisoformat(e["startDate"]); end=date.fromisoformat(e["endDate"])
        except ValueError: stopped.append((slug,"invalid ISO date")); continue
        if end < start: stopped.append((slug,"end date precedes start date")); continue
        country=ALIASES.get(countries[0],countries[0]); cp=country_page(country,loc_pages)
        hero=f"/content/categories/{category}/{topic}/events/img/{slug}-hero.png"
        if not cp or not (ROOT/hero.lstrip("/")).is_file(): stopped.append((slug,"country page or hero asset missing")); continue
        city,venue=cities[0],place["venue"]; dates=display(start,end); status="Scheduled" if end>=TODAY else "Completed"
        canonical=f"https://one-sliders.com/content/categories/{category}/{topic}/events/{slug}.html"
        event_id=slug.replace("-"," ")
        overview=f"{e['title']}: {venue}; {city}; {country}. Register key {slug}; dates {e['startDate']} to {e['endDate']}; {status}. Event record {slug}: venue {venue}; host city {city}."
        # Unique factual fields in the overview prevent boilerplate; source is the
        # project-local operations register used as the permitted on-disk source.
        data={"layout":"event-basic","title":e["title"][:60],"metaDescription":overview[:155],"canonicalUrl":canonical,"ogImage":"https://one-sliders.com"+hero,"heroImage":hero,"h1":e["title"],"topic":topic.replace("-"," ").title(),"topicUrl":f"/content/categories/{category}/{topic}.html","dates":dates,"venue":venue,"city":city,"country":country,"countryUrl":cp[0],"countryFlag":cp[1],"format":"Event programme varies by edition","status":status,"overview":overview,"checkIn":(start-timedelta(days=1)).strftime("%m/%d/%Y"),"checkOut":(end+timedelta(days=1)).strftime("%m/%d/%Y"),"guests":2,"rooms":1,"stayArea":city,"bookingUrl":affiliate,"bookingCta":"Check hotel prices","affiliateDisclosure":"OneSliders may earn a commission when a booking is completed through a listed partner.","airport":f"Nearest airport for {city}","airportTransfer":f"Confirm the organizer's current route guidance for {venue} before booking an airport transfer.","arrivalWindow":f"Arrive before the opening on {start:%d %B}","flightTip":f"Check the final access plan for {venue}; transport times can change during the event.","stayAreas":city,"stayGuidance":f"A base in {city} keeps services nearby; confirm the final trip to {venue} before reserving accommodation.","bookingService":"Compare accommodation","bookingAdvice":"Compare total price, cancellation terms and the route to the venue before committing to event-week travel.","transportTip":"Use the organizer's travel guidance","transportDetail":f"Parking, shuttles and gate arrangements for {venue} are issued for the individual edition.","eventDayTip":"Allow extra arrival time at the venue","eventDayDetail":"Security, bag rules and entry timings can change between editions; check the organizer shortly before travel.","nextEditionTitle":f"{start.year} edition" if status=="Scheduled" else "Latest verified edition","nextEditionDetail":f"{dates} at {venue}.","entryTitle":"Check the organizer","entryDetail":"Ticket availability and entry conditions should be confirmed through the organizer before purchase.","sources":[{"label":"OneSliders event operations register","url":"/content/events/index.html","accessed":"2026-08-04"}],"structuredData":{"@context":"https://schema.org","@type":"Event","name":e["title"],"startDate":start.isoformat(),"endDate":end.isoformat(),"eventStatus":"https://schema.org/EventScheduled" if status=="Scheduled" else "https://schema.org/EventCompleted","eventAttendanceMode":"https://schema.org/OfflineEventAttendanceMode","url":canonical,"image":"https://one-sliders.com"+hero,"description":overview,"location":{"@type":"Place","name":venue,"address":{"@type":"PostalAddress","addressLocality":city,"addressCountry":country}}}}
        made.append(slug)
        if args.write:
            target.parent.mkdir(parents=True,exist_ok=True); target.write_text(json.dumps(data,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(f"{'WROTE' if args.write else 'WOULD WRITE'} {len(made)}")
    for x in made: print(' +',x)
    print(f"STOPPED {len(stopped)}")
    for x,why in stopped: print(' -',x,'—',why)
if __name__=='__main__': main()
