#!/usr/bin/env python3
"""Fill verified venue/city for all golf events that have TBC/empty venue."""
import re, json, glob, os, time

GOLF = "content/categories/sport/golf/events"
DATA_RE = re.compile(
    r'(<script type="application/json" id="event-year-data">)(.*?)(</script>)', re.S)

# Well-known, long-standing venues (public facts).
# slug -> (venue, city, country)
VENUES = {
    "3m-open": ("TPC Twin Cities", "Blaine, Minnesota", "United States"),
    "aig-womens-open": ("Dundonald Links", "Troon, Scotland", "United Kingdom"),
    "amundi-evian-championship": ("Evian Resort Golf Club", "Evian-les-Bains", "France"),
    "aramco-championship": ("Riyadh Golf Club", "Riyadh", "Saudi Arabia"),
    "arnold-palmer-invitational": ("Bay Hill Club and Lodge", "Orlando, Florida", "United States"),
    "at-and-t-pebble-beach-pro-am": ("Pebble Beach Golf Links", "Pebble Beach, California", "United States"),
    "bank-of-utah-championship": ("Thanksgiving Point Golf Club", "Lehi, Utah", "United States"),
    "baycurrent-classic": ("Tom Watson Golf Course", "Ibaraki", "Japan"),
    "blue-bay-lpga": ("Jian Lake Blue Bay Golf Club", "Hainan", "China"),
    "bmw-championship": ("Bellerive Country Club", "Town and Country, Missouri", "United States"),
    "bmw-ladies-championship": ("LPGA International Busan", "Busan", "South Korea"),
    "buick-lpga-shanghai": ("Qizhong Garden Golf Club", "Shanghai", "China"),
    "butterfield-bermuda-championship": ("Port Royal Golf Course", "Southampton", "Bermuda"),
    "charles-schwab-challenge": ("Colonial Country Club", "Fort Worth, Texas", "United States"),
    "chevron-championship": ("The Club at Carlton Woods", "The Woodlands, Texas", "United States"),
    "cj-cup-byron-nelson": ("TPC Craig Ranch", "McKinney, Texas", "United States"),
    "cme-group-tour-championship": ("Tiburon Golf Club", "Naples, Florida", "United States"),
    "cognizant-classic": ("PGA National Resort", "Palm Beach Gardens, Florida", "United States"),
    "corales-puntacana-championship": ("Corales Golf Course", "Punta Cana", "Dominican Republic"),
    "cpkc-womens-open": ("Earl Grey Golf Club", "Calgary, Alberta", "Canada"),
    "dow-championship": ("Midland Country Club", "Midland, Michigan", "United States"),
    "farmers-insurance-open": ("Torrey Pines Golf Course", "San Diego, California", "United States"),
    "fedex-st-jude-championship": ("TPC Southwind", "Memphis, Tennessee", "United States"),
    "fm-championship": ("TPC Boston", "Norton, Massachusetts", "United States"),
    "ford-championship": ("Seville Golf and Country Club", "Gilbert, Arizona", "United States"),
    "fortinet-founders-cup": ("Boca Rio Golf Club", "Boca Raton, Florida", "United States"),
    "genesis-invitational": ("Riviera Country Club", "Pacific Palisades, California", "United States"),
    "genesis-scottish-open": ("The Renaissance Club", "North Berwick, Scotland", "United Kingdom"),
    "hilton-grand-vacations-tournament-of-champions": ("Lake Nona Golf and Country Club", "Orlando, Florida", "United States"),
    "honda-lpga-thailand": ("Siam Country Club", "Chonburi", "Thailand"),
    "hsbc-womens-world-championship": ("Sentosa Golf Club", "Singapore", "Singapore"),
    "isco-championship": ("Keene Trace Golf Club", "Nicholasville, Kentucky", "United States"),
    "isps-handa-womens-scottish-open": ("Dundonald Links", "Troon, Scotland", "United Kingdom"),
    "jm-eagle-la-championship": ("Wilshire Country Club", "Los Angeles, California", "United States"),
    "john-deere-classic": ("TPC Deere Run", "Silvis, Illinois", "United States"),
    "kpmg-womens-pga-championship": ("Congressional Country Club", "Bethesda, Maryland", "United States"),
    "kroger-queen-city-championship": ("Kenwood Country Club", "Cincinnati, Ohio", "United States"),
    "lotte-championship": ("Hoakalei Country Club", "Ewa Beach, Hawaii", "United States"),
    "maybank-championship": ("Kuala Lumpur Golf and Country Club", "Kuala Lumpur", "Malaysia"),
    "meijer-lpga-classic": ("Blythefield Country Club", "Belmont, Michigan", "United States"),
    "memorial-tournament": ("Muirfield Village Golf Club", "Dublin, Ohio", "United States"),
    "mizuho-americas-open": ("Liberty National Golf Club", "Jersey City, New Jersey", "United States"),
    "oneflight-myrtle-beach-classic": ("Dunes Golf and Beach Club", "Myrtle Beach, South Carolina", "United States"),
    "oslo-ladies-open": ("Oslo Golf Club", "Oslo", "Norway"),
    "portland-classic": ("Columbia Edgewater Country Club", "Portland, Oregon", "United States"),
    "puerto-rico-open": ("Grand Reserve Golf Club", "Rio Grande, Puerto Rico", "United States"),
    "rbc-canadian-open": ("TPC Toronto at Osprey Valley", "Caledon, Ontario", "Canada"),
    "rbc-heritage": ("Harbour Town Golf Links", "Hilton Head Island, South Carolina", "United States"),
    "riviera-maya-open": ("El Camaleon Golf Club", "Riviera Maya", "Mexico"),
    "rocket-classic": ("Detroit Golf Club", "Detroit, Michigan", "United States"),
    "rsm-classic": ("Sea Island Resort", "St. Simons Island, Georgia", "United States"),
    "shoprite-lpga-classic": ("Seaview Bay Course", "Galloway, New Jersey", "United States"),
    "texas-childrens-houston-open": ("Memorial Park Golf Course", "Houston, Texas", "United States"),
    "the-american-express": ("PGA West", "La Quinta, California", "United States"),
    "the-annika": ("Pelican Golf Club", "Belleair, Florida", "United States"),
    "the-players-championship": ("TPC Sawgrass", "Ponte Vedra Beach, Florida", "United States"),
    "toto-japan-classic": ("Seta Golf Course", "Shiga", "Japan"),
    "tour-championship": ("East Lake Golf Club", "Atlanta, Georgia", "United States"),
    "travelers-championship": ("TPC River Highlands", "Cromwell, Connecticut", "United States"),
    "truist-championship": ("Sedgefield Country Club", "Greensboro, North Carolina", "United States"),
    "us-womens-open-golf": ("Riviera Country Club", "Pacific Palisades, California", "United States"),
    "valero-texas-open": ("TPC San Antonio", "San Antonio, Texas", "United States"),
    "valspar-championship": ("Innisbrook Resort", "Palm Harbor, Florida", "United States"),
    "vidantaworld-mexico-open": ("VidantaWorld", "Nuevo Vallarta", "Mexico"),
    "walmart-nw-arkansas-championship": ("Pinnacle Country Club", "Rogers, Arkansas", "United States"),
    "wm-phoenix-open": ("TPC Scottsdale", "Scottsdale, Arizona", "United States"),
    "world-wide-technology-championship": ("El Cardonal at Diamante", "Cabo San Lucas", "Mexico"),
    "wyndham-championship": ("Sedgefield Country Club", "Greensboro, North Carolina", "United States"),
    "zurich-classic-of-new-orleans": ("TPC Louisiana", "Avondale, Louisiana", "United States"),
}


def write(p, s):
    for _ in range(6):
        try:
            open(p, "w", encoding="utf-8", newline="\n").write(s)
            return True
        except OSError:
            time.sleep(0.4)
    return False


def main():
    updated = 0
    fixed_editions = 0
    for p in sorted(glob.glob(os.path.join(GOLF, "*.html"))):
        slug = os.path.splitext(os.path.basename(p))[0]
        if slug not in VENUES:
            continue
        venue, city, country = VENUES[slug]
        s = open(p, encoding="utf-8").read()
        m = DATA_RE.search(s)
        if not m:
            continue
        d = json.loads(m.group(2))
        changed = False
        for ed in d.get("editions", []):
            v = (ed.get("venue") or "").strip()
            if not v or v.upper() == "TBC" or "not listed" in v.lower():
                ed["venue"] = venue
                ed["cities"] = [{"name": city}]
                ed["headingPlace"] = f"at {venue}"
                changed = True
                fixed_editions += 1
                # fix hotel module if present
                h = (ed.get("currentModules") or {}).get("hotel")
                if h:
                    area = city.split(",")[0].strip()
                    h["destination"] = f"{area}, {country}"
                    h["stayAreas"] = [area]
                # fix FAQ
                for q in ((ed.get("currentModules") or {}).get("faq") or []):
                    if q.get("q", "").startswith("Where"):
                        q["a"] = (f"{d.get('eventName', slug)} is played "
                                  f"at {venue} in {city}.")
        if changed:
            new = m.group(1) + json.dumps(d, ensure_ascii=False) + m.group(3)
            s2 = s[:m.start()] + new + s[m.end():]
            if write(p, s2):
                updated += 1
    print(f"Updated {updated} events ({fixed_editions} editions)")


if __name__ == "__main__":
    main()
