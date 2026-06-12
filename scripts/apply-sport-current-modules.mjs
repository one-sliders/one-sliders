import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sportRoot = path.join(root, 'content/categories/sport');
const today = new Date('2026-06-11T00:00:00Z');

const cityProfiles = {
  'Adelaide': {
    stayAreas: ['Adelaide CBD', 'Grange', 'Henley Beach', 'Glenelg', 'North Adelaide'],
    airport: ['Adelaide Airport works best', 'The airport is close to the coast and the city; Grange is a short local transfer rather than a separate resort base.'],
    interests: ['Beach tram days around Glenelg', 'Barossa or McLaren Vale wine detours', 'Compact city restaurants after play']
  },
  'Aichi-Nagoya': {
    stayAreas: ['Nagoya Station', 'Sakae', 'Kanayama', 'Aichi event clusters', 'Toyota area'],
    airport: ['Chubu Centrair is the main gateway', 'Nagoya Station is the practical rail base for multi-venue days around Aichi.'],
    interests: ['Nagoya food stops', 'Fast rail links around Aichi', 'Toyota and castle side trips']
  },
  'Asheville, North Carolina': {
    stayAreas: ['Downtown Asheville', 'Biltmore Village', 'Arden', 'Hendersonville', 'Black Mountain'],
    airport: ['Asheville Regional is closest', 'Charlotte can work for wider flight choice, but the mountain transfer is much longer.'],
    interests: ['Blue Ridge Parkway drives', 'Biltmore Estate time', 'Mountain breweries and food halls']
  },
  'Augusta': {
    stayAreas: ['Augusta', 'North Augusta', 'Aiken', 'Evans', 'Columbia'],
    airport: ['Augusta Regional is closest', 'Columbia and Atlanta can work when event-week rooms and fares tighten.'],
    interests: ['Augusta riverfront', 'Aiken golf-and-horse country', 'Classic Southern road-trip add-ons']
  },
  'Austin, Texas': {
    stayAreas: ['Downtown Austin', 'Barton Creek', 'Zilker', 'South Congress', 'The Domain'],
    airport: ['Austin-Bergstrom is closest', 'Barton Creek is west of downtown, so staying near the resort reduces match-day transfers.'],
    interests: ['Live music nights', 'Hill Country drives', 'BBQ and tacos between sessions']
  },
  'Ascot': {
    stayAreas: ['Ascot', 'Windsor', 'Sunningdale', 'Bracknell', 'London Paddington'],
    airport: ['Heathrow is closest', 'Royal Ascot is west of London; rail via Ascot or Windsor-area hotels usually beats driving on race days.'],
    interests: ['Windsor Castle add-on', 'Royal meeting fashion', 'Thames Valley race-week villages']
  },
  'Assen': {
    stayAreas: ['Assen', 'Groningen', 'Hoogeveen', 'Emmen', 'Zwolle'],
    airport: ['Amsterdam Schiphol has the most flights', 'Assen is rail-friendly, but circuit shuttles and bike routes matter on Dutch TT weekend.'],
    interests: ['Cathedral of Speed atmosphere', 'Groningen evenings', 'Drenthe cycling routes']
  },
  'Barcelona': {
    stayAreas: ['Eixample', 'Gothic Quarter', 'Sants', 'Poblenou', 'Barceloneta'],
    airport: ['Barcelona-El Prat is closest', 'Sants is useful when the event involves rail movement or a route stage.'],
    interests: ['Gaudi architecture', 'Beach recovery days', 'Fast rail links to nearby stages']
  },
  'Bathurst': {
    stayAreas: ['Bathurst', 'Mount Panorama area', 'Orange', 'Lithgow', 'Blue Mountains'],
    airport: ['Sydney Airport has the most flight choice', 'Bathurst is a regional race trip; many visitors drive or use coach and rail plans from Sydney.'],
    interests: ['Mount Panorama lap culture', 'Central Tablelands food and wine', 'Blue Mountains add-on']
  },
  'Basel': {
    stayAreas: ['Altstadt Grossbasel', 'Clara', 'SBB station', 'St. Jakob', 'Weil am Rhein'],
    airport: ['EuroAirport Basel Mulhouse Freiburg is closest', 'Basel SBB is the simplest base for arena transfers and regional rail.'],
    interests: ['Rhine walks', 'Old town museums', 'Three-country day trips']
  },
  'Bedminster, New Jersey': {
    stayAreas: ['Bedminster', 'Bridgewater', 'Morristown', 'Somerville', 'Newark Airport area'],
    airport: ['Newark is the main gateway', 'Staying west of Newark avoids repeated cross-city traffic to Somerset County.'],
    interests: ['New Jersey golf corridor', 'Morristown restaurants', 'New York add-on days']
  },
  'Berlin': {
    stayAreas: ['Mitte', 'Charlottenburg', 'Prenzlauer Berg', 'Friedrichshain', 'Alexanderplatz'],
    airport: ['BER is the main airport', 'Use U-Bahn/S-Bahn access as the deciding factor; Berlin event venues can sit on opposite sides of the city.'],
    interests: ['Museum Island', 'Cold-war history walks', 'Late food and music after games']
  },
  'Boston': {
    stayAreas: ['Back Bay', 'Downtown Boston', 'Cambridge', 'Brookline', 'Seaport'],
    airport: ['Logan is closest', 'For marathon weekend, rail access matters more than being beside the finish.'],
    interests: ['Freedom Trail', 'Charles River walks', 'College-town side trips']
  },
  'Busan': {
    stayAreas: ['Haeundae', 'Seomyeon', 'Gwangalli', 'Busan Station', 'Gijang'],
    airport: ['Gimhae is closest', 'Haeundae works well for a golf-and-coast trip; Seomyeon is better for transit.'],
    interests: ['Haeundae beach', 'Seafood markets', 'Coastal temple visits']
  },
  'Cape Town': {
    stayAreas: ['City Bowl', 'V&A Waterfront', 'Sea Point', 'Green Point', 'Camps Bay'],
    airport: ['Cape Town International is closest', 'Waterfront and Green Point keep transport simple for major-event days.'],
    interests: ['Table Mountain', 'Cape Peninsula drives', 'Winelands add-ons']
  },
  'Cheltenham': {
    stayAreas: ['Cheltenham centre', 'Racecourse area', 'Gloucester', 'Cotswolds villages', 'Birmingham'],
    airport: ['Birmingham and Bristol are useful', 'Cheltenham Spa rail plus local shuttles is often simpler than driving into Festival traffic.'],
    interests: ['Festival roar atmosphere', 'Cotswolds pub stops', 'Cheltenham Regency streets']
  },
  'Doha': {
    stayAreas: ['West Bay', 'Msheireb', 'The Pearl', 'Souq Waqif', 'Lusail'],
    airport: ['Hamad International is closest', 'Metro access is usually the easiest way to avoid event traffic.'],
    interests: ['Souq Waqif', 'Museum of Islamic Art', 'Desert evening trips']
  },
  'Durban': {
    stayAreas: ['Umhlanga', 'Durban beachfront', 'Morningside', 'Berea', 'Florida Road'],
    airport: ['King Shaka International is closest', 'Greyville is near central Durban; Umhlanga works better for a beach-and-racing trip.'],
    interests: ['Indian Ocean beach mornings', 'Durban curry stops', 'KwaZulu-Natal racing culture']
  },
  'Doral, Florida': {
    stayAreas: ['Doral', 'Miami Airport area', 'Coral Gables', 'Brickell', 'Miami Beach'],
    airport: ['Miami International is closest', 'Doral is west of Miami, so airport-area hotels can be more practical than the beach.'],
    interests: ['Miami food nights', 'Everglades half-day trips', 'Beach add-ons after the event']
  },
  'Daytona Beach': {
    stayAreas: ['Daytona Beach', 'Speedway area', 'Ormond Beach', 'Port Orange', 'Orlando'],
    airport: ['Daytona Beach International is closest', 'Orlando has far more flights; race-week traffic around the speedway needs extra time.'],
    interests: ['Speedway tours', 'Atlantic beach mornings', 'NASCAR fan zone']
  },
  'Abu Dhabi': {
    stayAreas: ['Yas Island', 'Saadiyat Island', 'Downtown Abu Dhabi', 'Al Maryah Island', 'Airport area'],
    airport: ['Abu Dhabi International is closest', 'Yas Island is the practical base for Yas Marina Circuit and race-week entertainment.'],
    interests: ['Yas Island theme parks', 'Marina race-week nights', 'Saadiyat beach and museums']
  },
  'Chicago': {
    stayAreas: ['Wrigleyville', 'River North', 'The Loop', 'Lincoln Park', 'West Loop'],
    airport: ['O Hare and Midway both work', 'For Wrigley Field, Red Line access matters more than raw distance.'],
    interests: ['Wrigleyville atmosphere', 'Lakefront days', 'Chicago food neighborhoods']
  },
  'Dubai': {
    stayAreas: ['Downtown Dubai', 'Business Bay', 'Dubai Marina', 'Deira', 'Meydan'],
    airport: ['Dubai International is closest', 'Meydan is inland; choose taxis or private transfer rather than assuming walkability.'],
    interests: ['Creek and souks', 'Marina evenings', 'Desert or Abu Dhabi add-ons']
  },
  'Dusseldorf|Mannheim': {
    stayAreas: ['Dusseldorf Altstadt', 'Dusseldorf Hbf', 'Mannheim Zentrum', 'Heidelberg', 'Cologne'],
    airport: ['Dusseldorf Airport is closest to Dusseldorf', 'Frankfurt Airport can be useful for Mannheim and long-haul arrivals.'],
    interests: ['Rhine old towns', 'Heidelberg day trip', 'German rail-based arena hopping']
  },
  'Frankfurt': {
    stayAreas: ['Innenstadt', 'Bahnhofsviertel', 'Sachsenhausen', 'Westend', 'Airport area'],
    airport: ['Frankfurt Airport is closest', 'Frankfurt is one of Europe rail hubs, so airport and Hauptbahnhof bases both work.'],
    interests: ['Main river walks', 'Apfelwein taverns', 'Fast rail add-ons around Germany']
  },
  'Fanling, Hong Kong': {
    stayAreas: ['Sha Tin', 'Tsim Sha Tsui', 'Central', 'Mong Kok', 'Fanling'],
    airport: ['Hong Kong International is the gateway', 'Stay near East Rail if you want easier movement to Fanling.'],
    interests: ['Victoria Harbour nights', 'New Territories walks', 'Dim sum and market stops']
  },
  'French Alps': {
    stayAreas: ['Nice', 'Briancon', 'Grenoble', 'Annecy', 'Lyon'],
    airport: ['Lyon, Geneva and Nice all matter', 'Pick the airport after the final venue cluster is confirmed; the French Alps are not one city.'],
    interests: ['Alpine rail trips', 'Ski-resort villages', 'Lakes and mountain passes']
  },
  'Honolulu, Hawaii': {
    stayAreas: ['Waikiki', 'Kahala', 'Ala Moana', 'Downtown Honolulu', 'Kapolei'],
    airport: ['Honolulu is closest', 'Waialae is on the east side of Honolulu; Waikiki and Kahala are the easiest visitor bases.'],
    interests: ['Waikiki beach mornings', 'Diamond Head walks', 'North Shore day trips']
  },
  'Goodwood': {
    stayAreas: ['Chichester', 'Goodwood Estate area', 'Portsmouth', 'Arundel', 'Brighton'],
    airport: ['Gatwick and Heathrow are the main gateways', 'Goodwood is rural; trains to Chichester plus shuttle or coach plans matter on Festival days.'],
    interests: ['Goodwood hillclimb', 'South Downs drives', 'Chichester and coastal add-ons']
  },
  'Hohenstein-Ernstthal': {
    stayAreas: ['Chemnitz', 'Zwickau', 'Hohenstein-Ernstthal', 'Dresden', 'Leipzig'],
    airport: ['Leipzig/Halle and Dresden are useful', 'Sachsenring is a small-town circuit; book rail, shuttle or parking plans early.'],
    interests: ['Sachsenring hillside grandstands', 'Chemnitz evenings', 'Saxony road-trip stops']
  },
  'Inglewood': {
    stayAreas: ['Inglewood', 'LAX area', 'Santa Monica', 'Downtown Los Angeles', 'Culver City'],
    airport: ['LAX is closest', 'SoFi sits beside LAX, but beach or downtown bases may suit longer Los Angeles trips.'],
    interests: ['Beach days in Santa Monica', 'Hollywood and studio add-ons', 'Food halls and live entertainment']
  },
  'Las Vegas': {
    stayAreas: ['The Strip', 'Downtown Las Vegas', 'Paradise', 'Henderson', 'Summerlin'],
    airport: ['Harry Reid International is closest', 'The Strip is usually the simplest base for Allegiant Stadium or the F1 street circuit.'],
    interests: ['Strip race-week energy', 'Downtown food and music', 'Desert day trips']
  },
  'Istanbul': {
    stayAreas: ['Besiktas', 'Taksim', 'Karakoy', 'Sultanahmet', 'Kadikoy'],
    airport: ['Istanbul Airport is the main gateway', 'Besiktas or Taksim reduce cross-city pressure for a stadium final.'],
    interests: ['Bosphorus ferries', 'Historic peninsula walks', 'Late-night food around Besiktas']
  },
  'Indian Wells': {
    stayAreas: ['Indian Wells', 'Palm Desert', 'La Quinta', 'Rancho Mirage', 'Palm Springs'],
    airport: ['Palm Springs International is closest', 'Coachella Valley hotels fill quickly; staying near Highway 111 keeps transfers simple.'],
    interests: ['Desert tennis campus', 'Palm Springs architecture', 'Joshua Tree add-on']
  },
  'Johannesburg': {
    stayAreas: ['Sandton', 'Rosebank', 'Melrose', 'Midrand', 'Lanseria area'],
    airport: ['OR Tambo is the main gateway', 'Lanseria can be convenient for Steyn City and northern Johannesburg.'],
    interests: ['Cradle of Humankind', 'Rosebank food and markets', 'Safari add-ons']
  },
  'Jerez': {
    stayAreas: ['Jerez centre', 'El Puerto de Santa Maria', 'Cadiz', 'Seville', 'Circuit area'],
    airport: ['Jerez Airport is closest; Seville has more choice', 'Race traffic is concentrated around the circuit, so shuttle and parking plans matter.'],
    interests: ['Andalucian MotoGP crowds', 'Sherry bodegas', 'Cadiz coast add-ons']
  },
  'Le Mans': {
    stayAreas: ['Le Mans centre', 'Circuit area', 'Tours', 'Angers', 'Paris Montparnasse'],
    airport: ['Paris CDG or Orly plus rail is common', 'Le Mans is usually easier by train than by a local flight.'],
    interests: ['Old town Le Mans', 'Loire Valley detours', 'Race-week campsites and grandstand culture']
  },
  'Madrid': {
    stayAreas: ['Centro', 'Sol', 'Salamanca', 'Atocha', 'Canillejas'],
    airport: ['Madrid Barajas is closest', 'Metropolitano is east of the centre; metro access is the key hotel filter.'],
    interests: ['Tapas neighborhoods', 'Museum triangle', 'Late-night football atmosphere']
  },
  'London': {
    stayAreas: ['Westminster', 'South Bank', 'Paddington', 'Earls Court', 'King Cross'],
    airport: ['Heathrow has the most long-haul choice', 'Pick the airport by venue side: Heathrow west, Gatwick south, Stansted/Luton north.'],
    interests: ['Museums and theatre', 'River walks', 'Premier League or cricket add-ons']
  },
  'Liverpool': {
    stayAreas: ['Liverpool city centre', 'Waterfront', 'Aintree', 'Southport', 'Ormskirk'],
    airport: ['Liverpool John Lennon is closest; Manchester has more flights', 'Aintree has rail access from central Liverpool, which is usually easier than driving.'],
    interests: ['Grand National festival days', 'Waterfront museums', 'Music and food nights']
  },
  'Louisville': {
    stayAreas: ['Downtown Louisville', 'Old Louisville', 'NuLu', 'Airport area', 'Highlands'],
    airport: ['Louisville Muhammad Ali International is closest', 'Churchill Downs sits south of downtown; Derby week rewards early transport planning.'],
    interests: ['Bourbon trail add-ons', 'Derby Museum', 'NuLu restaurants']
  },
  'Los Angeles': {
    stayAreas: ['Downtown Los Angeles', 'Hollywood', 'Santa Monica', 'Culver City', 'LAX area'],
    airport: ['LAX is the main gateway', 'Los Angeles is spread out; stay on the side of town where most event days happen.'],
    interests: ['Beach days', 'Studio tours', 'Food and live-event add-ons']
  },
  'Melbourne': {
    stayAreas: ['CBD', 'Southbank', 'Richmond', 'East Melbourne', 'St Kilda'],
    airport: ['Melbourne Airport is the main gateway', 'For MCG and Melbourne Park events, CBD, Richmond and East Melbourne are the simplest bases.'],
    interests: ['Laneway food and coffee', 'Yarra walks', 'Great Ocean Road add-on']
  },
  'Mexico City': {
    stayAreas: ['Polanco', 'Roma Norte', 'Condesa', 'Centro Historico', 'Chapultepec'],
    airport: ['Mexico City airport is closest', 'Traffic is the planning problem; choose a base near metro corridors or the event side of town.'],
    interests: ['Food neighborhoods', 'Museums around Chapultepec', 'Teotihuacan day trip']
  },
  'Miami Gardens': {
    stayAreas: ['Aventura', 'Hollywood Beach', 'Fort Lauderdale', 'Downtown Miami', 'Miami Beach'],
    airport: ['Fort Lauderdale and Miami airports both work', 'Hard Rock Stadium sits between Miami and Fort Lauderdale, so choose by flights and traffic direction.'],
    interests: ['Miami Open campus', 'Beach add-ons', 'Little Havana and Wynwood food days']
  },
  'Montevideo': {
    stayAreas: ['Centro', 'Ciudad Vieja', 'Pocitos', 'Punta Carretas', 'Tres Cruces'],
    airport: ['Carrasco International is closest', 'Tres Cruces is useful for buses; Pocitos and Punta Carretas are better for a longer stay.'],
    interests: ['Rambla walks', 'Ciudad Vieja match-day build-up', 'Uruguayan football history']
  },
  'Monaco': {
    stayAreas: ['Monaco', 'Beausoleil', 'Nice', 'Menton', 'Cap-d Ail'],
    airport: ['Nice is closest', 'Train access from Nice and Menton is often more realistic than staying in Monaco itself.'],
    interests: ['Harbour walks', 'French Riviera rail trips', 'Hill towns above the coast']
  },
  'Montreal': {
    stayAreas: ['Downtown Montreal', 'Old Montreal', 'Plateau', 'Griffintown', 'Longueuil'],
    airport: ['Montreal-Trudeau is closest', 'Metro access is useful for Circuit Gilles Villeneuve on Ile Notre-Dame.'],
    interests: ['Old Montreal', 'Food markets', 'St Lawrence riverfront']
  },
  'Motegi': {
    stayAreas: ['Utsunomiya', 'Mito', 'Motegi', 'Tokyo', 'Tsukuba'],
    airport: ['Tokyo airports are the main gateways', 'Motegi is rural; many fans base in Utsunomiya or Mito and plan dedicated transfers.'],
    interests: ['Twin Ring Motegi museum', 'Nikko side trip', 'Tokyo add-on days']
  },
  'Mugello': {
    stayAreas: ['Florence', 'Borgo San Lorenzo', 'Scarperia', 'Prato', 'Bologna'],
    airport: ['Florence is closest; Bologna and Pisa can work', 'Mugello is rural, so train-plus-shuttle or pre-booked transfers are part of the trip.'],
    interests: ['Tuscan hills around the circuit', 'Florence art mornings', 'Italian MotoGP atmosphere']
  },
  'New Orleans, Louisiana': {
    stayAreas: ['French Quarter', 'Warehouse District', 'CBD', 'Garden District', 'Mid-City'],
    airport: ['New Orleans airport is closest', 'Bayou Oaks is in City Park, so Mid-City can be a clever base.'],
    interests: ['Live music nights', 'Creole food', 'Streetcar and riverfront days']
  },
  'New Orleans': {
    stayAreas: ['French Quarter', 'CBD', 'Warehouse District', 'Garden District', 'Uptown'],
    airport: ['New Orleans airport is closest', 'The Superdome is walkable from CBD/Warehouse District hotels, but event traffic still bites.'],
    interests: ['Live music nights', 'Creole food', 'Streetcar and riverfront days']
  },
  'New York': {
    stayAreas: ['Midtown Manhattan', 'Long Island City', 'Downtown Brooklyn', 'Upper West Side', 'Flushing'],
    airport: ['JFK, LaGuardia and Newark all work', 'Choose by venue side; New York travel time can matter more than distance.'],
    interests: ['Museums and Broadway', 'Food neighborhoods', 'Harbor and skyline walks']
  },
  'Newcastle upon Tyne|South Shields': {
    stayAreas: ['Newcastle Quayside', 'Central Station', 'Jesmond', 'Gateshead', 'South Shields'],
    airport: ['Newcastle Airport is closest', 'Metro access is useful for moving between city start areas and the coast.'],
    interests: ['Quayside evenings', 'North Sea coast finish', 'Hadrian wall side trips']
  },
  'Paris': {
    stayAreas: ['Opera', 'Latin Quarter', 'Montparnasse', 'Bastille', 'La Defense'],
    airport: ['CDG has the most long-haul choice', 'Use RER or metro access as the main hotel filter for event days.'],
    interests: ['Museum time', 'Cafe neighborhoods', 'Fast rail side trips']
  },
  'Pasadena': {
    stayAreas: ['Old Pasadena', 'Downtown Los Angeles', 'Glendale', 'Burbank', 'Arcadia'],
    airport: ['Burbank is convenient; LAX has more flights', 'Rose Bowl event traffic is distinctive, so shuttle and parking plans matter.'],
    interests: ['Tournament of Roses traditions', 'San Gabriel Mountain views', 'Old Pasadena restaurants']
  },
  'Philadelphia': {
    stayAreas: ['Center City', 'Stadium District', 'University City', 'Old City', 'Airport area'],
    airport: ['Philadelphia International is closest', 'SEPTA access to NRG Station is useful for Lincoln Financial Field and South Philadelphia event days.'],
    interests: ['Historic district mornings', 'South Philadelphia food stops', 'Stadium District doubleheaders']
  },
  'Omaha': {
    stayAreas: ['Downtown Omaha', 'Old Market', 'North Downtown', 'Council Bluffs', 'Midtown'],
    airport: ['Eppley Airfield is closest', 'Charles Schwab Field sits north of downtown, so Old Market and North Downtown are the easiest fan bases.'],
    interests: ['College World Series fan zone', 'Old Market restaurants', 'Missouri Riverfront walks']
  },
  'Riyadh': {
    stayAreas: ['Olaya', 'King Abdullah Financial District', 'Al Malqa', 'Diplomatic Quarter', 'Airport area'],
    airport: ['King Khalid International is closest', 'Riyadh is car-led; stay near the event cluster or book reliable transfers.'],
    interests: ['Diriyah evenings', 'Modern dining districts', 'Desert edge excursions']
  },
  'Roubaix': {
    stayAreas: ['Lille centre', 'Roubaix', 'Tourcoing', 'Villeneuve-d Ascq', 'Kortrijk'],
    airport: ['Lille Airport is closest; Brussels and Paris can work', 'For Paris-Roubaix, Lille is usually the practical base for the velodrome finish and rail links.'],
    interests: ['Roubaix Velodrome finish', 'Lille old town', 'Cobbled-sector day trips']
  },
  'Rocester, England': {
    stayAreas: ['Uttoxeter', 'Stoke-on-Trent', 'Derby', 'Ashbourne', 'Stafford'],
    airport: ['East Midlands and Manchester are useful', 'JCB Golf and Country Club is rural; car or coach transfers matter.'],
    interests: ['Peak District drives', 'Country pubs', 'Midlands golf stops']
  },
  'Singapore': {
    stayAreas: ['Marina Bay', 'Orchard', 'Sentosa', 'Clarke Quay', 'Chinatown'],
    airport: ['Changi is closest', 'Sentosa is easiest for Sentosa Golf Club; the city centre works for broader Singapore days.'],
    interests: ['Hawker centres', 'Gardens by the Bay', 'Marina Bay nights']
  },
  'Sao Paulo': {
    stayAreas: ['Jardins', 'Paulista', 'Pinheiros', 'Brooklin', 'Interlagos area'],
    airport: ['Guarulhos is the main long-haul airport', 'Congonhas can be useful domestically; Interlagos is south of the city centre.'],
    interests: ['Interlagos race culture', 'Paulista museums', 'Brazilian food neighborhoods']
  },
  'Silverstone': {
    stayAreas: ['Silverstone', 'Towcester', 'Milton Keynes', 'Northampton', 'Oxford'],
    airport: ['London Luton and Birmingham are useful', 'Race-week traffic is heavy; shuttle and parking plans matter more than map distance.'],
    interests: ['Motorsport Valley stops', 'Oxford add-on', 'Country-pub evenings']
  },
  'Sepang': {
    stayAreas: ['KLIA area', 'Putrajaya', 'Sepang', 'Cyberjaya', 'Kuala Lumpur city centre'],
    airport: ['Kuala Lumpur International is closest', 'Sepang sits beside KLIA; city-centre hotels add a long race-day transfer.'],
    interests: ['Tropical night markets', 'Kuala Lumpur skyline days', 'Sepang circuit fan zones']
  },
  'Sebring': {
    stayAreas: ['Sebring', 'Lake Placid', 'Avon Park', 'Winter Haven', 'Orlando'],
    airport: ['Orlando and Tampa have the most flight choice', 'Sebring is a regional endurance-racing trip; rental car or RV logistics matter.'],
    interests: ['Historic airfield circuit', 'Central Florida lakes', 'IMSA paddock atmosphere']
  },
  'Phillip Island': {
    stayAreas: ['Cowes', 'San Remo', 'Newhaven', 'Inverloch', 'Melbourne'],
    airport: ['Melbourne Airport is the main gateway', 'Phillip Island is a road trip from Melbourne; book island lodging or coach transfers early.'],
    interests: ['Coastal circuit views', 'Penguin Parade add-on', 'Surf beaches between sessions']
  },
  'Sotogrande, Andalucia': {
    stayAreas: ['Sotogrande', 'Estepona', 'Marbella', 'Gibraltar', 'La Linea'],
    airport: ['Gibraltar is closest; Malaga has more flights', 'Valderrama is easiest from Costa del Sol bases with a car or transfer.'],
    interests: ['Costa del Sol golf', 'Gibraltar day trip', 'Marbella and Estepona evenings']
  },
  'Sterling, Virginia': {
    stayAreas: ['Reston', 'Tysons', 'Dulles Airport area', 'Leesburg', 'Arlington'],
    airport: ['Dulles is closest', 'Staying near Dulles or Reston keeps transfers short to Trump National Washington D.C.'],
    interests: ['Washington D.C. museums', 'Virginia wine country', 'Potomac river walks']
  },
  'Sydney': {
    stayAreas: ['CBD', 'Darling Harbour', 'Surry Hills', 'Bondi Junction', 'Parramatta'],
    airport: ['Sydney Airport is closest', 'For route events, rail access and early-start logistics matter more than hotel views.'],
    interests: ['Harbour walks', 'Beaches', 'Blue Mountains add-on']
  },
  'Tokyo': {
    stayAreas: ['Shinjuku', 'Tokyo Station', 'Ginza', 'Ueno', 'Shibuya'],
    airport: ['Haneda is closest to central Tokyo', 'Narita can work for international fares, but add transfer time.'],
    interests: ['Food districts', 'Rail day trips', 'Museum and garden mornings']
  },
  'Washington, D.C.': {
    stayAreas: ['Downtown DC', 'Penn Quarter', 'Capitol Hill', 'Dupont Circle', 'Arlington'],
    airport: ['Reagan National is closest', 'For the National Mall, Metro access and walking routes matter more than hotel distance.'],
    interests: ['Smithsonian museum days', 'Monument walks', 'Capitol-area event atmosphere']
  },
  'Williamsport': {
    stayAreas: ['Williamsport', 'South Williamsport', 'Lewisburg', 'Danville', 'State College'],
    airport: ['Williamsport Regional is closest but limited', 'Harrisburg and State College can be practical alternatives for more flight choice.'],
    interests: ['Little League complex atmosphere', 'Susquehanna River towns', 'Family-focused baseball week']
  },
  'Toronto': {
    stayAreas: ['Downtown Toronto', 'Waterfront', 'Yorkville', 'Union Station', 'Mississauga'],
    airport: ['Toronto Pearson is the main gateway', 'Billy Bishop is convenient for downtown if flights fit.'],
    interests: ['Harbourfront', 'Niagara side trip', 'Food neighborhoods']
  },
  'Turin': {
    stayAreas: ['Centro', 'Porta Nuova', 'Lingotto', 'Crocetta', 'San Salvario'],
    airport: ['Turin Airport is closest; Milan can work for long-haul choice', 'Inalpi Arena is southwest of the centre, so tram and metro access are useful hotel filters.'],
    interests: ['Indoor tennis week', 'Piedmont food and wine', 'Alpine day trips']
  },
  'United Kingdom / Ireland': {
    stayAreas: ['London', 'Cardiff', 'Manchester', 'Dublin', 'Glasgow'],
    airport: ['Choose by match city', 'This is a multi-country tournament; pick the base after the fixture draw, not just by headline host.'],
    interests: ['Rail-based match hopping', 'Classic football cities', 'Pub and stadium culture']
  },
  'Westfield, Indiana': {
    stayAreas: ['Carmel', 'Westfield', 'Downtown Indianapolis', 'Fishers', 'Noblesville'],
    airport: ['Indianapolis is closest', 'Northern suburbs are more practical than downtown for Chatham Hills.'],
    interests: ['Indianapolis food and sports', 'Suburban golf corridor', 'Short Midwest road trips']
  }
};

const slugOverrides = {
  'afc-asian-cup': {
    cityKey: 'Riyadh',
    destination: 'Riyadh, Saudi Arabia',
    stayAreas: ['Riyadh', 'Jeddah', 'Khobar', 'Olaya', 'KAFD'],
    airport: ['Riyadh, Jeddah and Dammam all matter', 'The 2027 Asian Cup is spread across Riyadh, Jeddah and Khobar, so book after your match city is known.'],
    interests: ['Three-city Saudi tournament route', 'New stadiums and renovated venues', 'Ahlan Asia host branding and large travelling support'],
    detail: 'The tournament is scheduled for 7 January to 5 February 2027 in Saudi Arabia, with venues in Riyadh, Jeddah and Khobar.'
  },
  'africa-cup-of-nations': {
    cityKey: 'Cape Town',
    destination: 'Nairobi, Dar es Salaam and Kampala region',
    stayAreas: ['Nairobi', 'Dar es Salaam', 'Kampala', 'Arusha', 'Entebbe'],
    airport: ['Use the host city airport once fixtures are published', 'Kenya, Tanzania and Uganda are co-hosting; do not book a single-city base until venue allocation is clear.'],
    interests: ['First three-country AFCON', 'East Africa football culture', 'Safari or coast add-ons if fixtures allow'],
    detail: 'AFCON 2027 is planned for Kenya, Tanzania and Uganda. Venue allocation still needs close checking before booking.'
  },
  'fifa-womens-world-cup': {
    cityKey: 'Brazil',
    destination: 'Brazil host cities',
    stayAreas: ['Rio de Janeiro', 'Sao Paulo', 'Brasilia', 'Salvador', 'Belo Horizonte'],
    airport: ['Choose by assigned host city', 'Brazil 2027 uses several host cities; long domestic flights can be part of the trip.'],
    interests: ['First Women World Cup in South America', 'Brazil stadium culture', 'Beach, food and music add-ons around match cities'],
    detail: 'Brazil hosts the 2027 FIFA Women World Cup from 24 June to 25 July 2027.'
  },
  'fifa-world-cup': {
    destination: 'North America host cities',
    stayAreas: ['Mexico City', 'Toronto', 'New York region', 'Los Angeles', 'Dallas'],
    airport: ['Pick by fixture city', 'The 2026 World Cup spans 16 host cities in Canada, Mexico and the United States; the final is in the New York New Jersey region.'],
    interests: ['48-team format', 'Three-country travel route', 'Final-week base in the New York region'],
    detail: 'The 2026 FIFA World Cup runs 11 June to 19 July across Canada, Mexico and the United States.'
  },
  'uefa-european-championship': {
    cityKey: 'United Kingdom / Ireland',
    destination: 'United Kingdom and Ireland host cities',
    detail: 'UEFA EURO 2028 is hosted by the United Kingdom and Ireland; venue choice depends on the match draw.'
  },
  'cricket-world-cup': {
    destination: 'South Africa, Zimbabwe and Namibia',
    stayAreas: ['Johannesburg', 'Cape Town', 'Durban', 'Harare', 'Windhoek'],
    airport: ['Choose by fixtures', 'This is a regional tournament across southern Africa, so flights between host countries may be part of the plan.'],
    interests: ['Southern Africa cricket route', 'Safari and coast add-ons', 'Multi-country fan travel'],
    detail: 'The 2027 Cricket World Cup is planned for South Africa, Zimbabwe and Namibia.'
  },
  'icc-t20-world-cup': {
    destination: 'India and Sri Lanka',
    stayAreas: ['Mumbai', 'Delhi', 'Bengaluru', 'Colombo', 'Kandy'],
    airport: ['Choose by match city', 'India and Sri Lanka hosting means domestic and regional flights matter once fixtures are out.'],
    interests: ['Subcontinent cricket crowds', 'Short-format double-header energy', 'Food and temple-city side trips']
  },
  'rugby-world-cup': {
    cityKey: 'Sydney',
    destination: 'Australia host cities',
    stayAreas: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide'],
    airport: ['Choose by match city', 'Australia 2027 will be a multi-city trip; wait for fixtures before locking every hotel night.'],
    interests: ['Wallabies home tournament', 'Long-distance Australian travel', 'Beach and city add-ons between match days']
  },
  'summer-olympics': {
    cityKey: 'Los Angeles',
    destination: 'Los Angeles, United States',
    detail: 'LA28 runs 14-30 July 2028, with venues spread across the Los Angeles region.'
  },
  'winter-olympics': {
    cityKey: 'French Alps',
    destination: 'French Alps, France',
    detail: 'The 2030 Winter Olympics are planned for the French Alps region; exact venue clusters shape the trip.'
  },
  'state-of-origin': {
    cityKey: 'Sydney',
    destination: 'Sydney, Melbourne and Brisbane, Australia',
    stayAreas: ['Sydney Olympic Park', 'Melbourne CBD', 'South Bank Brisbane', 'Surry Hills', 'Southbank Melbourne'],
    airport: ['Use the airport for each game city', 'The series moves between Sydney, Melbourne and Brisbane, so one hotel base is not enough for every match.'],
    interests: ['Three-game rugby league series', 'City-to-city fan travel', 'Stadium atmospheres in NSW, Victoria and Queensland']
  },
  'six-nations': {
    cityKey: 'London',
    destination: 'Six Nations host cities',
    stayAreas: ['London', 'Cardiff', 'Dublin', 'Edinburgh', 'Paris', 'Rome'],
    airport: ['Choose by fixture weekend', 'Six Nations travel is fixture-led; the best airport is the home city for the match you attend.'],
    interests: ['Rugby pub weekends', 'Rail and short-haul fixture hopping', 'Classic European capitals']
  }
};

const topicLabels = {
  'american-football': 'Football trip',
  'aussie-rules': 'AFL trip',
  baseball: 'Baseball trip',
  basketball: 'Basketball trip',
  cricket: 'Cricket trip',
  cycling: 'Cycling trip',
  football: 'Football trip',
  'formula-1': 'Race trip',
  golf: 'Golf trip',
  'horse-racing': 'Race trip',
  'ice-hockey': 'Hockey trip',
  marathon: 'Run trip',
  motogp: 'MotoGP trip',
  motorsport: 'Race trip',
  'multi-sport': 'Games trip',
  rugby: 'Rugby trip',
  running: 'Run trip',
  tennis: 'Tennis trip'
};

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function extractEventData(source) {
  const match = source.match(/<script type="application\/json" id="event-year-data">([\s\S]*?)<\/script>/);
  if (!match) return null;
  return { raw: match[1], data: JSON.parse(match[1]) };
}

function activeEdition(data) {
  return (data.editions || []).find((edition) => edition.year === data.defaultYear)
    || (data.editions || []).find((edition) => edition.status === 'upcoming');
}

function isUsefulVenue(value) {
  return value && !/\bTBC\b|Venue TBC|host city tbc/i.test(value);
}

function isFutureOrCurrent(edition) {
  if (!edition || edition.status === 'past') return false;
  if (!edition.startDate) return true;
  const end = new Date(`${edition.endExclusive || edition.startDate}T23:59:59Z`);
  return Number.isNaN(end.getTime()) || end >= today;
}

function topicFromFile(file) {
  const parts = file.replace(/\\/g, '/').split('/');
  const sportIndex = parts.indexOf('sport');
  return sportIndex >= 0 ? parts[sportIndex + 1] : 'sport';
}

function cleanCityName(city) {
  return String(city || '')
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/\s+region$/i, '')
    .trim();
}

function firstCityKey(edition) {
  const joined = (edition.cities || []).map((city) => city.name).filter(Boolean).join('|');
  if (cityProfiles[joined]) return joined;
  const first = cleanCityName(joined.split('|')[0]);
  return cityProfiles[first] ? first : '';
}

function defaultProfile(edition) {
  const cityNames = (edition.cities || []).map((city) => city.name).filter(Boolean);
  const countryNames = (edition.countries || []).map((country) => country.name).filter(Boolean);
  const city = cleanCityName(cityNames[0] || edition.venue || 'Host city');
  const country = countryNames.join(' / ') || '';
  const genericBase = city && !/TBC|host city|venue|not listed/i.test(city) ? city : (country || 'Host area');
  return {
    stayAreas: [
      genericBase,
      `${genericBase} downtown`,
      `${genericBase} airport area`,
      'Venue-side hotels',
      'Nearby suburbs'
    ].filter((value, index, list) => value && list.indexOf(value) === index),
    airport: ['Check the nearest major airport', 'Use the official venue and local transport guidance before booking.'],
    interests: [
      `${edition.venue || 'The venue'} event days`,
      country ? `${country} travel add-ons` : 'Local sports culture',
      'Food and recovery time between sessions'
    ]
  };
}

function datePlus(iso, days) {
  if (!iso) return '';
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return '';
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function checkInDate(edition) {
  return datePlus(edition.startDate, edition.startDate ? -1 : 0);
}

function checkOutDate(edition) {
  if (edition.endExclusive) return edition.endExclusive;
  return datePlus(edition.startDate, 2);
}

function destinationFor(edition, override) {
  if (override?.destination) return override.destination;
  const cityNames = (edition.cities || []).map((city) => city.name).filter(Boolean);
  const countryNames = (edition.countries || []).map((country) => country.name).filter(Boolean);
  const city = cleanCityName(cityNames[0] || '');
  const country = countryNames[0] || '';
  if (city && country && !city.toLowerCase().includes(country.toLowerCase())) return `${city}, ${country}`;
  return city || country || 'TBC';
}

function moduleFor(file, data, edition) {
  const topic = topicFromFile(file);
  const override = slugOverrides[data.slug] || {};
  const cityKey = override.cityKey || firstCityKey(edition);
  const profile = {
    ...defaultProfile(edition),
    ...(cityKey ? cityProfiles[cityKey] : {}),
    ...override
  };
  const tripLabel = topicLabels[topic] || 'Sports trip';
  const eventName = `${data.eventName} ${edition.year || ''}`.trim();
  const pageEvent = data.slug || path.basename(file, '.html');
  const destination = destinationFor(edition, override);
  const stayAreas = (profile.stayAreas || []).slice(0, 6);
  const interestCards = (profile.interests || []).slice(0, 4);
  while (interestCards.length < 4) {
    interestCards.push(`Use ${eventName} as the anchor and keep transfers realistic around ${edition.venue || 'the venue'}.`);
  }
  const placeAnswer = (() => {
    const venue = edition.venue || 'Venue TBC';
    if (!destination || destination === 'TBC') return `${venue}.`;
    const venueNorm = venue.toLowerCase().trim();
    const destinationNorm = destination.toLowerCase().trim();
    if (destinationNorm === venueNorm || destinationNorm.startsWith(`${venueNorm},`)) return `${destination}.`;
    return `${venue}, ${destination}.`;
  })();

  return {
    hotel: {
      title: `Stay for ${eventName}`,
      destination,
      checkIn: checkInDate(edition),
      checkOut: checkOutDate(edition),
      adults: 2,
      rooms: 1,
      stayAreas,
      cta: 'Check hotel prices',
      campaign: `${pageEvent}-${edition.year || 'current'}-hotels`,
      pageTopic: topic,
      pageEvent,
      airportNote: {
        title: profile.airport?.[0] || 'Airport planning matters',
        detail: profile.airport?.[1] || 'Check the official venue transport page before booking flights and hotels.'
      }
    },
    golfTrip: {
      tabLabel: tripLabel,
      eyebrow: tripLabel,
      title: `Plan the ${eventName} trip`,
      cardLabel: 'Trip',
      cards: [
        { title: 'Best base', detail: stayAreas.length > 1 ? `${stayAreas[0]} is the first area to check; ${stayAreas.slice(1, 3).join(' and ')} can work if prices spike.` : `${destination} is the first base to check once official venue access is clear.` },
        { title: 'Venue reality', detail: profile.detail || `${edition.venue || 'The venue'} shapes the trip; confirm gates, transit and session timing close to the event.` },
        { title: interestCards[0], detail: interestCards[1] },
        { title: interestCards[2], detail: interestCards[3] }
      ],
      links: [
        {
          builder: 'product',
          label: 'See travel essentials',
          category: 'travel-essentials',
          campaign: `${pageEvent}-${edition.year || 'current'}-travel-essentials`,
          event: 'affiliate_click',
          affiliateType: 'product',
          pageTopic: topic,
          pageEvent
        }
      ]
    },
    faq: [
      { q: `When is ${eventName}?`, a: edition.dates || (edition.startDate || 'TBC') },
      { q: `Where is ${eventName}?`, a: placeAnswer },
      { q: `Where should I stay for ${eventName}?`, a: stayAreas.length ? `${stayAreas.slice(0, 3).join(', ')} are the first areas to compare.` : 'Wait for the official venue and transport plan before booking.' },
      { q: `What is interesting about this edition?`, a: profile.detail || `${edition.venue || destination} gives this edition its travel shape; the best plan depends on official timing and local transport.` }
    ]
  };
}

function isStrictUsCanadaEdition(edition) {
  const countries = (edition?.countries || []).map((country) => country.name).filter(Boolean);
  return countries.length > 0 && countries.every((name) => /^(United States|Canada)$/.test(name));
}

function shouldPatch(file, data, edition) {
  if (!isStrictUsCanadaEdition(edition)) return false;
  if (!isFutureOrCurrent(edition)) return false;
  if (edition.currentModules) {
    const protectedSlugs = new Set(['ryder-cup', 'wimbledon', 'masters-tournament']);
    return !protectedSlugs.has(data.slug || '') && Boolean(edition.currentModules.hotel?.campaign);
  }
  if (slugOverrides[data.slug]) return true;
  const cityNames = (edition.cities || []).map((city) => city.name).filter(Boolean).join('|');
  if (/\bTBC\b|Host city TBC/i.test(cityNames)) return false;
  const key = firstCityKey(edition);
  return Boolean(key || cityNames || isUsefulVenue(edition.venue) || isStrictUsCanadaEdition(edition));
}

const files = walk(sportRoot).filter((file) => file.endsWith('.html') && file.includes(`${path.sep}events${path.sep}`));
const patched = [];
const skipped = [];

for (const file of files) {
  const source = fs.readFileSync(file, 'utf8');
  const parsed = extractEventData(source);
  if (!parsed) continue;
  const edition = activeEdition(parsed.data);
  if (!edition) continue;
  if (!shouldPatch(file, parsed.data, edition)) {
    if (!edition.currentModules && isFutureOrCurrent(edition)) skipped.push(path.relative(root, file));
    continue;
  }
  edition.currentModules = moduleFor(file, parsed.data, edition);
  const nextJson = JSON.stringify(parsed.data);
  const nextSource = source.replace(parsed.raw, nextJson);
  if (nextSource !== source) {
    fs.writeFileSync(file, nextSource, 'utf8');
    patched.push(path.relative(root, file));
  }
}

console.log(JSON.stringify({ patched: patched.length, skipped: skipped.length, patchedFiles: patched, skippedFiles: skipped }, null, 2));
