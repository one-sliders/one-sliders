# rebuild-locations.ps1
$BASE = 'C:\Users\AndersEriksson\3DF\OneSlider\content\locations'

$BBOX = @{
  'africa'='-20,-37,55,38'; 'antarctica'='-180,-90,180,-60'; 'asia'='26,-12,150,55'
  'europe'='-25,34,45,72'; 'north-america'='-170,7,-50,84'
  'oceania'='110,-48,180,-8'; 'south-america'='-82,-57,-34,15'
  'algeria'='-8.7,18.9,12.0,37.1'; 'angola'='11.7,-18.0,24.1,-4.4'
  'benin'='0.8,6.1,3.9,12.4'; 'botswana'='19.9,-26.9,29.4,-17.8'
  'burkina-faso'='-5.5,9.4,2.4,15.1'; 'burundi'='28.9,-4.5,30.9,-2.3'
  'cameroon'='8.5,1.7,16.2,13.1'; 'cape-verde'='-25.4,14.8,-22.7,17.2'
  'central-african-republic'='14.4,2.2,27.5,11.0'; 'chad'='13.5,7.4,24.0,23.5'
  'comoros'='43.2,-12.4,44.5,-11.4'; 'congo'='11.1,-5.0,18.6,3.7'
  'democratic-republic-of-congo'='12.2,-13.5,31.3,5.4'; 'djibouti'='41.8,10.9,43.4,12.7'
  'egypt'='24.7,22.0,37.1,31.7'; 'equatorial-guinea'='8.0,1.0,11.4,3.8'
  'eritrea'='36.4,12.4,43.1,18.0'; 'eswatini'='30.8,-27.3,32.1,-25.7'
  'ethiopia'='33.0,3.4,47.9,15.0'; 'gabon'='8.7,-3.9,14.5,2.3'
  'gambia'='-16.8,13.0,-13.8,13.8'; 'ghana'='-3.3,4.7,1.2,11.2'
  'guinea'='-15.1,7.2,-7.7,12.7'; 'guinea-bissau'='-16.7,10.9,-13.6,12.7'
  'ivory-coast'='-8.6,4.3,-2.5,10.7'; 'kenya'='33.9,-4.7,41.9,5.0'
  'lesotho'='27.0,-30.7,29.5,-28.6'; 'liberia'='-11.5,4.4,-7.4,8.6'
  'libya'='9.3,19.5,25.2,33.2'; 'madagascar'='43.2,-25.6,50.5,-12.1'
  'malawi'='32.7,-17.1,35.9,-9.4'; 'mali'='-4.2,10.1,4.3,25.0'
  'mauritania'='-17.1,14.7,-4.8,27.3'; 'mauritius'='57.3,-20.5,57.8,-19.9'
  'morocco'='-13.2,27.7,-1.0,35.9'; 'mozambique'='30.2,-26.9,40.8,-10.5'
  'namibia'='11.7,-29.0,25.3,-16.9'; 'niger'='0.2,11.7,15.9,23.5'
  'nigeria'='2.7,4.3,14.7,13.9'; 'rwanda'='28.9,-2.8,30.9,-1.1'
  'sao-tome-and-principe'='6.4,-0.1,7.5,1.7'; 'senegal'='-17.5,12.3,-11.4,16.7'
  'sierra-leone'='-13.3,6.9,-10.3,9.9'; 'somalia'='40.9,-1.7,51.4,12.0'
  'south-africa'='16.5,-34.8,32.9,-22.1'; 'south-sudan'='24.2,3.5,36.0,12.2'
  'sudan'='21.8,8.7,38.6,22.2'; 'tanzania'='29.3,-11.8,40.4,-1.0'
  'togo'='0.0,6.1,1.8,11.1'; 'tunisia'='7.5,30.2,11.6,37.3'
  'uganda'='29.6,-1.5,35.0,4.2'; 'zambia'='21.9,-18.1,33.5,-8.2'
  'zimbabwe'='25.2,-22.4,33.1,-15.6'
  'afghanistan'='60.5,29.4,74.9,38.5'; 'bahrain'='50.5,25.8,50.8,26.3'
  'bangladesh'='88.0,20.7,92.7,26.6'; 'bhutan'='88.7,26.7,92.1,28.3'
  'brunei'='114.0,4.0,115.4,5.1'; 'cambodia'='102.3,10.0,107.6,14.7'
  'china'='73.7,18.2,134.8,53.6'; 'east-timor'='124.0,-9.5,127.3,-8.1'
  'india'='68.2,8.1,97.4,37.1'; 'indonesia'='95.0,-11.0,141.0,6.1'
  'iran'='44.0,25.1,63.3,39.8'; 'iraq'='38.8,29.1,48.6,37.4'
  'israel'='34.3,29.5,35.9,33.3'; 'japan'='123.0,24.0,146.0,46.0'
  'jordan'='34.9,29.2,39.3,33.4'; 'kazakhstan'='50.3,40.6,87.4,55.4'
  'kuwait'='46.6,28.5,48.4,30.1'; 'kyrgyzstan'='69.3,39.2,80.3,43.3'
  'laos'='100.1,13.9,107.7,22.5'; 'lebanon'='35.1,33.1,36.6,34.7'
  'malaysia'='99.6,0.9,119.3,7.4'; 'maldives'='72.6,-0.7,73.7,7.1'
  'mongolia'='87.8,41.6,119.9,52.2'; 'myanmar'='92.3,9.8,101.2,28.5'
  'nepal'='80.1,26.4,88.2,30.4'; 'north-korea'='124.2,37.7,130.7,42.7'
  'oman'='52.0,16.6,59.8,26.4'; 'pakistan'='60.9,23.8,77.8,37.1'
  'philippines'='117.2,4.6,126.6,20.0'; 'qatar'='50.7,24.5,51.6,26.2'
  'saudi-arabia'='36.6,16.4,55.7,32.2'; 'singapore'='103.6,1.2,104.0,1.5'
  'south-korea'='126.1,33.1,129.6,38.6'; 'sri-lanka'='79.7,5.9,81.9,9.8'
  'syria'='35.7,32.3,42.4,37.3'; 'taiwan'='120.0,22.0,122.0,25.3'
  'tajikistan'='67.4,36.7,75.2,41.0'; 'thailand'='97.3,5.6,105.7,20.5'
  'turkmenistan'='52.4,35.1,66.7,42.8'; 'united-arab-emirates'='51.6,22.6,56.4,26.1'
  'uzbekistan'='55.9,37.2,73.2,45.6'; 'vietnam'='102.1,8.6,109.5,23.4'
  'yemen'='42.6,12.6,54.0,19.0'
  'albania'='19.2,39.6,21.1,42.7'; 'andorra'='1.4,42.4,1.8,42.7'
  'armenia'='43.4,38.8,46.6,41.3'; 'austria'='9.5,46.4,17.2,49.0'
  'azerbaijan'='44.8,38.4,50.4,41.9'; 'belarus'='23.2,51.3,32.8,53.7'
  'belgium'='2.5,49.5,6.4,51.5'; 'bosnia-and-herzegovina'='15.7,42.6,19.6,45.3'
  'bulgaria'='22.4,41.2,28.6,44.2'; 'croatia'='13.5,42.4,19.5,46.6'
  'cyprus'='32.3,34.6,34.6,35.7'; 'czechia'='12.1,48.6,18.9,51.1'
  'denmark'='8.1,54.6,15.2,57.8'; 'estonia'='21.8,57.5,28.2,59.7'
  'finland'='19.1,59.8,31.6,70.1'; 'france'='-5.1,41.3,9.6,51.1'
  'georgia'='39.9,41.1,46.7,43.6'; 'germany'='5.9,47.3,15.0,55.1'
  'greece'='19.4,34.8,29.6,42.0'; 'hungary'='16.1,45.7,22.9,48.6'
  'iceland'='-24.5,63.3,-13.4,66.6'; 'ireland'='-10.5,51.4,-6.0,55.4'
  'italy'='6.6,37.0,18.5,47.1'; 'kosovo'='20.0,41.9,21.8,43.3'
  'latvia'='20.9,55.7,28.2,57.9'; 'liechtenstein'='9.5,47.0,9.6,47.3'
  'lithuania'='20.9,53.9,26.8,56.5'; 'luxembourg'='5.7,49.5,6.5,50.2'
  'malta'='14.2,35.8,14.6,36.1'; 'moldova'='26.6,45.5,30.2,48.5'
  'monaco'='7.4,43.7,7.5,43.8'; 'montenegro'='18.4,41.8,20.4,43.6'
  'netherlands'='3.3,50.7,7.2,53.6'; 'north-macedonia'='20.5,40.9,23.0,42.4'
  'norway'='4.6,57.9,31.1,71.2'; 'poland'='14.1,49.0,24.2,55.0'
  'portugal'='-9.5,37.0,-6.2,42.2'; 'romania'='20.3,43.7,29.7,48.3'
  'russia'='27.0,41.2,180.0,77.7'; 'san-marino'='12.41,43.89,12.52,43.96'
  'serbia'='18.8,42.2,22.9,46.2'; 'slovakia'='16.8,47.7,22.6,49.6'
  'slovenia'='13.4,45.4,16.6,46.9'; 'spain'='-9.3,36.0,3.3,43.8'
  'sweden'='10.9,55.3,24.2,69.1'; 'switzerland'='6.0,45.8,10.5,47.8'
  'turkey'='25.9,35.8,44.8,42.1'; 'ukraine'='22.1,44.4,40.2,52.4'
  'united-kingdom'='-8.2,49.9,1.8,60.9'; 'vatican-city'='12.44,41.90,12.46,41.91'
  'antigua-and-barbuda'='-61.9,16.9,-61.7,17.7'; 'bahamas'='-79.0,20.9,-72.7,27.3'
  'barbados'='-59.7,13.0,-59.4,13.4'; 'belize'='-89.2,15.9,-87.5,18.5'
  'canada'='-141.0,41.7,-52.6,83.1'; 'costa-rica'='-85.9,8.0,-82.6,11.2'
  'cuba'='-84.9,19.8,-74.1,23.2'; 'dominica'='-61.5,15.2,-61.3,15.6'
  'dominican-republic'='-72.0,17.5,-68.3,19.9'; 'el-salvador'='-90.1,13.1,-87.7,14.5'
  'grenada'='-61.8,11.9,-61.6,12.3'; 'guatemala'='-92.2,13.7,-88.2,17.8'
  'haiti'='-74.5,18.0,-71.6,20.1'; 'honduras'='-89.4,13.0,-83.1,16.5'
  'jamaica'='-78.4,17.7,-76.2,18.5'; 'mexico'='-118.4,14.5,-86.7,32.7'
  'nicaragua'='-87.7,10.7,-83.1,15.0'; 'panama'='-83.1,7.2,-77.2,9.6'
  'saint-kitts-and-nevis'='-62.9,17.1,-62.5,17.4'; 'saint-lucia'='-61.1,13.7,-60.9,14.1'
  'saint-vincent-and-the-grenadines'='-61.5,12.9,-61.1,13.4'
  'trinidad-and-tobago'='-61.9,10.0,-60.5,11.4'; 'united-states'='-125.0,24.5,-66.9,49.4'
  'argentina'='-73.6,-55.1,-53.6,-21.8'; 'bolivia'='-69.6,-22.9,-57.5,-9.7'
  'brazil'='-73.1,-33.8,-28.8,5.3'; 'chile'='-75.7,-55.9,-66.4,-17.5'
  'colombia'='-79.0,-4.2,-66.9,12.5'; 'ecuador'='-81.0,-5.0,-75.2,1.4'
  'guyana'='-60.0,1.2,-56.5,8.6'; 'paraguay'='-62.6,-27.6,-54.3,-19.3'
  'peru'='-81.3,-18.4,-68.7,0.0'; 'suriname'='-58.1,2.0,-54.0,6.0'
  'uruguay'='-58.4,-34.9,-53.1,-30.1'; 'venezuela'='-73.4,0.6,-59.8,12.2'
  'australia'='112.9,-43.7,153.7,-10.7'; 'fiji'='177.0,-19.2,180.0,-16.0'
  'kiribati'='-174.5,-3.4,-169.0,3.4'; 'marshall-islands'='160.8,4.6,172.0,14.6'
  'micronesia'='137.0,1.0,163.0,10.0'; 'nauru'='166.85,-0.55,166.95,-0.45'
  'new-zealand'='166.5,-47.3,178.6,-34.4'; 'palau'='131.1,2.8,134.7,8.1'
  'papua-new-guinea'='141.0,-11.7,156.0,-1.3'; 'samoa'='-172.8,-14.1,-171.5,-13.4'
  'solomon-islands'='155.5,-11.9,162.7,-5.1'; 'tonga'='-175.7,-22.3,-173.7,-15.6'
  'tuvalu'='176.0,-9.0,179.2,-5.6'; 'vanuatu'='166.5,-20.3,170.2,-13.1'
  'stockholm'='17.7,59.2,18.3,59.5'; 'gothenburg'='11.8,57.6,12.1,57.8'
  'malmo'='12.9,55.5,13.1,55.7'; 'london'='-0.5,51.3,0.3,51.7'
  'paris'='2.1,48.7,2.6,49.0'; 'berlin'='13.1,52.4,13.7,52.7'
  'madrid'='-3.9,40.3,-3.5,40.6'; 'rome'='12.3,41.7,12.6,42.0'
  'oslo'='10.6,59.8,10.9,60.0'; 'copenhagen'='12.4,55.6,12.7,55.8'
  'helsinki'='24.8,60.1,25.0,60.3'; 'amsterdam'='4.8,52.3,5.0,52.4'
  'brussels'='4.3,50.8,4.5,50.9'; 'vienna'='16.2,48.1,16.6,48.3'
  'zurich'='8.4,47.3,8.7,47.5'; 'moscow'='37.3,55.6,37.8,55.9'
  'istanbul'='28.8,40.9,29.3,41.2'; 'athens'='23.6,37.9,24.0,38.1'
  'budapest'='18.9,47.4,19.2,47.6'; 'prague'='14.3,50.0,14.6,50.2'
  'warsaw'='20.8,52.1,21.1,52.3'; 'lisbon'='-9.2,38.7,-9.1,38.8'
  'dublin'='-6.4,53.3,-6.2,53.4'; 'reykjavik'='-22.1,64.1,-21.8,64.2'
  'tallinn'='24.7,59.4,24.8,59.5'; 'riga'='24.1,56.9,24.2,57.0'
  'vilnius'='25.2,54.6,25.4,54.7'; 'minsk'='27.5,53.9,27.7,54.0'
  'kyiv'='30.5,50.4,30.8,50.6'; 'sofia'='23.3,42.6,23.4,42.8'
  'bucharest'='25.9,44.3,26.2,44.5'; 'belgrade'='20.3,44.7,20.5,44.9'
  'zagreb'='15.9,45.7,16.1,45.9'; 'sarajevo'='18.3,43.8,18.5,43.9'
  'tirana'='19.8,41.3,19.9,41.4'; 'chisinau'='28.8,46.9,28.9,47.0'
  'yerevan'='44.5,40.2,44.6,40.3'; 'baku'='49.8,40.3,49.9,40.5'
  'tbilisi'='44.7,41.6,44.9,41.8'; 'nicosia'='33.3,35.1,33.5,35.2'
  'cairo'='31.2,30.0,31.4,30.2'; 'nairobi'='36.8,-1.3,36.9,-1.2'
  'addis-ababa'='38.7,9.0,38.8,9.1'; 'lagos'='3.3,6.4,3.5,6.5'
  'kinshasa'='15.3,-4.4,15.4,-4.3'; 'khartoum'='32.5,15.5,32.6,15.6'
  'algiers'='3.0,36.7,3.1,36.8'; 'tunis'='10.1,36.8,10.2,36.9'
  'casablanca'='-7.7,33.5,-7.5,33.6'; 'johannesburg'='27.9,-26.3,28.1,-26.1'
  'cape-town'='18.3,-34.1,18.5,-33.9'; 'dar-es-salaam'='39.2,-6.9,39.3,-6.8'
  'kampala'='32.5,0.3,32.7,0.4'; 'kigali'='30.0,-1.9,30.1,-1.9'
  'luanda'='13.2,-8.8,13.3,-8.8'; 'lusaka'='28.2,-15.5,28.4,-15.4'
  'maputo'='32.6,-26.0,32.6,-25.9'; 'harare'='31.0,-17.9,31.1,-17.8'
  'windhoek'='17.0,-22.6,17.1,-22.5'; 'gaborone'='25.9,-24.7,26.0,-24.6'
  'beijing'='116.2,39.8,116.6,40.1'; 'tokyo'='139.6,35.5,140.0,35.8'
  'delhi'='77.0,28.5,77.3,28.8'; 'mumbai'='72.8,18.9,73.0,19.1'
  'dhaka'='90.3,23.7,90.5,23.8'; 'islamabad'='73.0,33.6,73.1,33.7'
  'riyadh'='46.6,24.6,46.8,24.8'; 'tehran'='51.3,35.6,51.5,35.8'
  'baghdad'='44.3,33.3,44.5,33.4'; 'bangkok'='100.4,13.7,100.6,13.9'
  'jakarta'='106.8,-6.2,107.0,-6.1'; 'kuala-lumpur'='101.6,3.1,101.8,3.2'
  'seoul'='126.9,37.5,127.1,37.6'
  'new-york'='-74.1,40.6,-73.9,40.8'; 'mexico-city'='-99.2,19.3,-99.0,19.5'
  'havana'='-82.5,23.0,-82.3,23.2'; 'buenos-aires'='-58.6,-34.7,-58.4,-34.5'
  'sao-paulo'='-46.8,-23.7,-46.6,-23.5'; 'lima'='-77.1,-12.1,-76.9,-12.0'
  'bogota'='-74.2,4.6,-74.0,4.7'; 'santiago'='-70.8,-33.6,-70.6,-33.4'
  'caracas'='-67.0,10.4,-66.8,10.5'; 'canberra'='149.0,-35.4,149.2,-35.3'
  'sydney'='151.1,-33.9,151.3,-33.8'; 'auckland'='174.7,-36.9,174.9,-36.8'
  'wellington'='174.7,-41.3,174.9,-41.2'; 'suva'='178.4,-18.2,178.5,-18.1'
  'port-moresby'='147.1,-9.5,147.2,-9.4'
}

function Get-OsmSrc([string]$key, [string]$fallback) {
  $b = if ($BBOX.ContainsKey($key)) { $BBOX[$key] } else { $BBOX[$fallback] }
  return "https://www.openstreetmap.org/export/embed.html?bbox=$b&layer=mapnik"
}

function Get-HtmlData([string]$content) {
  $d = @{}
  $d['title'] = [regex]::Match($content, '<title>(.*?)</title>').Groups[1].Value -replace ',.*$',''
  $d['theme'] = [regex]::Match($content, '--theme:\s*(#[a-fA-F0-9]{3,8})').Groups[1].Value
  $d['accent'] = [regex]::Match($content, '--accent:\s*(#[a-fA-F0-9]{3,8})').Groups[1].Value
  $d['ink'] = [regex]::Match($content, '--ink:\s*(#[a-fA-F0-9]{3,8})').Groups[1].Value
  $d['paper'] = [regex]::Match($content, '--paper:\s*(#[a-fA-F0-9]{3,8})').Groups[1].Value
  $d['muted'] = [regex]::Match($content, '--muted:\s*(#[a-fA-F0-9]{3,8})').Groups[1].Value
  $d['line'] = [regex]::Match($content, '--line:\s*(rgba\([^)]+\))').Groups[1].Value
  $m = [regex]::Match($content, "url\(['""]?(https?://[^'"")\s]+)['""]?\)")
  $d['heroUrl'] = $m.Groups[1].Value
  $d['eyebrow'] = [regex]::Match($content, 'class="eyebrow">(.*?)</p>').Groups[1].Value
  $d['intro'] = [regex]::Match($content, 'class="intro">([\s\S]*?)</p>').Groups[1].Value.Trim()
  $facts = [ordered]@{}
  foreach ($fm in [regex]::Matches($content, '<div class="fact"><span>(.*?)</span><strong>(.*?)</strong></div>')) {
    $facts[$fm.Groups[1].Value] = $fm.Groups[2].Value
  }
  $d['facts'] = $facts
  $details = [ordered]@{}
  foreach ($dm in [regex]::Matches($content, '<div class="detail">\s*<span>([\s\S]*?)</span>\s*<strong>([\s\S]*?)</strong>\s*</div>')) {
    $details[$dm.Groups[1].Value.Trim()] = $dm.Groups[2].Value.Trim()
  }
  $d['details'] = $details
  $navM = [regex]::Match($content, '<nav class="(?:top-menu|continent-menu)"[^>]*>([\s\S]*?)</nav>')
  $d['navHtml'] = $navM.Groups[1].Value.Trim()
  $flagM = [regex]::Match($content, '<img class="flag" src="([^"]+)"')
  $d['flagSrc'] = $flagM.Groups[1].Value
  $d['countryItems'] = [regex]::Matches($content, '<li><a href="([^"]+)"><img src="([^"]+)"[^>]+> <span>([^<]+)</span></a></li>')
  $d['cityLinks'] = [regex]::Matches($content, '<a class="city-link" href="([^"]+)"[\s\S]*?<strong>(.*?)</strong>[\s\S]*?</a>')
  $capM = [regex]::Match($content, 'class="capital-card"[\s\S]*?<strong>(.*?)</strong>')
  $d['capital'] = $capM.Groups[1].Value
  $d['knownFor'] = if ($d['details']['Known for']) { $d['details']['Known for'] } else { $d['eyebrow'] }
  return $d
}

function Get-CSS([hashtable]$d) {
  $theme = if ($d['theme']) { $d['theme'] } else { '#315f72' }
  $accent = if ($d['accent']) { $d['accent'] } else { '#9bc5d2' }
  $ink = if ($d['ink']) { $d['ink'] } else { '#17201c' }
  $paper = if ($d['paper']) { $d['paper'] } else { '#fbfaf6' }
  $muted = if ($d['muted']) { $d['muted'] } else { '#5f6b63' }
  $line = if ($d['line']) { $d['line'] } else { 'rgba(23,32,28,0.14)' }
  return "      :root{--theme:$theme;--accent:$accent;--ink:$ink;--paper:$paper;--muted:$muted;--line:$line}
      *{box-sizing:border-box}body{margin:0;font-family:Arial,Helvetica,sans-serif;color:var(--ink);background:var(--paper);overflow-x:hidden}a{color:inherit}
      .top-menu{position:sticky;top:0;z-index:3;display:flex;gap:8px;overflow-x:auto;padding:8px clamp(14px,3vw,36px);background:rgba(251,250,246,.95);border-bottom:1px solid var(--line);backdrop-filter:blur(10px)}
      .top-menu a{flex:0 0 auto;padding:7px 12px;border-radius:999px;text-decoration:none;font-size:13px;color:var(--ink)}
      .top-menu a:hover,.top-menu a.active{background:var(--theme);color:white}
      .slide{display:grid;grid-template-columns:minmax(300px,.9fr) minmax(480px,1.1fr);min-height:calc(100vh - 43px);gap:clamp(14px,2vw,28px);padding:clamp(12px,2vw,28px);align-items:start}
      .left-col{display:grid;gap:10px;position:sticky;top:55px}
      .hero{min-height:clamp(200px,28vh,320px);border-radius:8px;overflow:hidden;display:grid;align-items:end;padding:clamp(16px,2.5vw,28px);color:white;box-shadow:0 14px 38px rgba(0,0,0,.18)}
      .eyebrow{margin:0 0 6px;color:var(--accent);font-size:12px;font-weight:700;text-transform:uppercase}
      h1{margin:0;font-size:clamp(36px,5vw,68px);line-height:.94}
      .intro{margin:10px 0 0;font-size:clamp(14px,1.4vw,17px);line-height:1.36;max-width:600px}
      .map-wrap{border-radius:8px;overflow:hidden;border:1px solid var(--line)}
      .map-wrap iframe{display:block;width:100%;height:210px;border:none}
      .flag{width:88px;height:66px;border-radius:6px;background:white;box-shadow:0 0 0 1px rgba(255,255,255,.3),0 8px 18px rgba(0,0,0,.22);margin-bottom:14px;object-fit:contain}
      .right-col{display:grid;gap:12px;padding-top:2px}
      .known-for{margin:0;font-size:14px;line-height:1.4;padding:10px 13px;border-radius:8px;background:white;border:1px solid var(--line);border-left:4px solid var(--accent)}
      .known-for span{display:block;color:var(--muted);font-size:11px;text-transform:uppercase;font-weight:700;margin-bottom:4px}
      .fact-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
      .fact{padding:10px 12px;border:1px solid var(--line);border-left:4px solid var(--theme);border-radius:8px;background:white;box-shadow:0 4px 12px rgba(0,0,0,.04)}
      .fact span{display:block;color:var(--muted);font-size:11px;text-transform:uppercase;font-weight:600}
      .fact strong{display:block;margin-top:4px;font-size:clamp(13px,1.5vw,18px);line-height:1.1}
      .section-label{margin:0 0 8px;font-size:17px;font-weight:700}
      .country-grid{list-style:none;display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:6px;margin:0;padding:0;max-height:30vh;overflow-y:auto}
      .country-grid a{display:flex;align-items:center;gap:8px;padding:7px 9px;border:1px solid var(--line);border-left:3px solid var(--theme);border-radius:7px;background:white;text-decoration:none;font-size:13px;box-shadow:0 3px 8px rgba(0,0,0,.04)}
      .country-grid a:hover{transform:translateY(-1px);border-color:var(--theme)}
      .country-grid img{width:24px;height:18px;border-radius:3px;object-fit:contain;box-shadow:0 0 0 1px rgba(0,0,0,.12)}
      .city-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:8px}
      .city-link{display:flex;align-items:center;justify-content:space-between;padding:11px 13px;border:1px solid var(--line);border-left:4px solid var(--theme);border-radius:8px;background:white;text-decoration:none;font-size:14px;box-shadow:0 4px 12px rgba(0,0,0,.05)}
      .city-link span{display:block;color:var(--muted);font-size:11px;text-transform:uppercase;font-weight:600}
      .city-link strong{display:block;margin-top:3px;font-size:16px}
      .city-link em{color:var(--muted);font-style:normal;font-size:12px}
      .city-link:hover{transform:translateY(-1px);border-color:var(--theme)}
      .religion-wrap{display:grid;grid-template-columns:120px 1fr;gap:14px;align-items:center;padding:12px 14px;border:1px solid var(--line);border-radius:8px;background:white}
      .religion-title{display:block;font-size:11px;text-transform:uppercase;font-weight:700;color:var(--muted);margin-bottom:6px}
      .pie{width:96px;height:96px;border-radius:50%}
      .pie-legend{list-style:none;margin:0;padding:0;display:grid;gap:4px}
      .pie-legend li{display:flex;align-items:center;gap:8px;font-size:13px}
      .pie-legend li span{width:12px;height:12px;border-radius:2px;flex:0 0 auto}
      .religion-wrap p{margin:6px 0 0;color:var(--muted);font-size:12px}
      .map-context{margin-top:4px}
      .map-context p{margin:0 0 4px;font-size:12px;color:var(--muted)}
      .map-context .map-wrap iframe{height:140px}
      .site-footer{padding:14px clamp(14px,3vw,36px);color:var(--muted);font-size:13px;border-top:1px solid var(--line);background:rgba(251,250,246,.92)}
      .site-footer p{margin:0}.site-footer a{color:inherit}
      @media(max-width:1000px){.slide{grid-template-columns:1fr}.left-col{position:static}}
      @media(max-width:600px){.fact-grid{grid-template-columns:1fr}.country-grid{max-height:none}}"
}

function Get-PieChart([hashtable]$d) {
  $theme = if ($d['theme']) { $d['theme'] } else { '#315f72' }
  $accent = if ($d['accent']) { $d['accent'] } else { '#9bc5d2' }
  $largest = if ($d['facts']['Largest religion']) { $d['facts']['Largest religion'] } else { $d['details']['Largest religion'] }
  if ($largest -match 'Islam') {
    $groups = @(@('Islam',88,$theme),@('Christianity',4,$accent),@('No religion',3,'#b0b8b4'),@('Other',5,'#d8d8d4'))
  } elseif ($largest -match 'Hinduism') {
    $groups = @(@('Hinduism',78,$theme),@('Islam',14,$accent),@('Christianity',3,'#b0b8b4'),@('Other',5,'#d8d8d4'))
  } elseif ($largest -match 'Buddhism') {
    $groups = @(@('Buddhism',62,$theme),@('Folk / other',18,$accent),@('No religion',12,'#b0b8b4'),@('Other',8,'#d8d8d4'))
  } elseif ($largest -match 'Judaism') {
    $groups = @(@('Judaism',74,$theme),@('Islam',18,$accent),@('Christianity',2,'#b0b8b4'),@('Other',6,'#d8d8d4'))
  } elseif ($largest -match 'No religion') {
    $groups = @(@('No religion',55,$theme),@('Christianity',25,$accent),@('Folk / other',12,'#b0b8b4'),@('Other',8,'#d8d8d4'))
  } else {
    $groups = @(@('Christianity',62,$theme),@('No religion',18,$accent),@('Islam',8,'#b0b8b4'),@('Other',12,'#d8d8d4'))
  }
  $start = 0; $stops = @(); $legend = @()
  foreach ($g in $groups) {
    $end = $start + [int]$g[1]
    $stops += "$($g[2]) $start% $end%"
    $legend += "            <li><span style=`"background:$($g[2])`"></span>$($g[0]) $($g[1])%</li>"
    $start = $end
  }
  return "      <div class=`"religion-wrap`">
        <div>
          <span class=`"religion-title`">Religion dist.</span>
          <div class=`"pie`" style=`"background:conic-gradient($($stops -join ','))`"></div>
        </div>
        <div>
          <ul class=`"pie-legend`">
$(($legend -join "`n"))
          </ul>
          <p>Broad estimate by religious grouping.</p>
        </div>
      </div>"
}

function Build-ContinentPage([string]$content, [string]$bboxKey) {
  $d = Get-HtmlData $content
  $osmSrc = Get-OsmSrc $bboxKey 'europe'
  $css = Get-CSS $d
  $f = $d['facts']; $dt = $d['details']
  $countries = if ($f['Countries']) { $f['Countries'] } elseif ($dt['Listed countries']) { $dt['Listed countries'] } else { '&mdash;' }
  $area = if ($f['Area']) { $f['Area'] } else { '&mdash;' }
  $worldShare = if ($f['World share']) { $f['World share'] } else { '&mdash;' }
  $pop = if ($f['Population']) { $f['Population'] } else { '&mdash;' }
  $largest = if ($dt['Largest population']) { $dt['Largest population'] } else { '&mdash;' }
  $regions = if ($dt['Regions']) { $dt['Regions'] } else { '&mdash;' }
  $climate = if ($dt['Climate']) { $dt['Climate'] } else { '&mdash;' }
  $knownFor = if ($dt['Known for']) { $dt['Known for'] } else { $d['eyebrow'] }
  $gridHtml = ''
  foreach ($ci in $d['countryItems']) {
    $href = $ci.Groups[1].Value; $imgSrc = $ci.Groups[2].Value; $name = $ci.Groups[3].Value
    $gridHtml += "              <li><a href=`"$href`"><img src=`"$imgSrc`" alt=`"`" loading=`"lazy`" width=`"24`" height=`"18`"><span>$name</span></a></li>`n"
  }
  $title = $d['title']; $navHtml = $d['navHtml']; $heroUrl = $d['heroUrl']
  $eyebrow = $d['eyebrow']; $intro = $d['intro']
  return "<!doctype html>`n<html lang=`"en`">`n  <head>`n    <meta charset=`"utf-8`">`n    <meta name=`"viewport`" content=`"width=device-width, initial-scale=1`">`n    <title>$title</title>`n    <style>`n$css`n    </style>`n  </head>`n  <body>`n    <nav class=`"top-menu`" aria-label=`"Continents`">`n      $navHtml`n    </nav>`n    <main class=`"slide`">`n      <aside class=`"left-col`">`n        <div class=`"hero`" style=`"background:linear-gradient(180deg,rgba(0,0,0,.06),rgba(0,0,0,.54)),url('$heroUrl') center/cover`">`n          <div>`n            <p class=`"eyebrow`">$eyebrow</p>`n            <h1>$title</h1>`n            <p class=`"intro`">$intro</p>`n          </div>`n        </div>`n        <div class=`"map-wrap`"><iframe src=`"$osmSrc`" loading=`"lazy`" title=`"Map of $title`"></iframe></div>`n      </aside>`n      <section class=`"right-col`" aria-label=`"$title facts`">`n        <div class=`"fact-grid`">`n          <div class=`"fact`"><span>Countries</span><strong>$countries</strong></div>`n          <div class=`"fact`"><span>Area</span><strong>$area</strong></div>`n          <div class=`"fact`"><span>Size ranking</span><strong>&mdash;</strong></div>`n          <div class=`"fact`"><span>Share of land</span><strong>$worldShare</strong></div>`n          <div class=`"fact`"><span>Population</span><strong>$pop</strong></div>`n          <div class=`"fact`"><span>Population ranking</span><strong>&mdash;</strong></div>`n          <div class=`"fact`"><span>Largest country</span><strong>$largest</strong></div>`n          <div class=`"fact`"><span>Regions</span><strong>$regions</strong></div>`n          <div class=`"fact`"><span>Climate</span><strong>$climate</strong></div>`n          <div class=`"fact`"><span>Highest point</span><strong>&mdash;</strong></div>`n          <div class=`"fact`"><span>Largest religion</span><strong>&mdash;</strong></div>`n          <div class=`"fact`"><span>Religious diversity</span><strong>&mdash;</strong></div>`n          <div class=`"fact`" style=`"grid-column:span 2`"><span>Known for</span><strong>$knownFor</strong></div>`n        </div>`n        <div>`n          <p class=`"section-label`">Countries</p>`n          <nav aria-label=`"Countries in $title`"><ul class=`"country-grid`">`n$gridHtml          </ul></nav>`n        </div>`n      </section>`n    </main>`n    <footer class=`"site-footer`"><p>&copy; 2026 <a href=`"https://3dfractal.no/`">3D Fractal</a>. All rights reserved.</p></footer>`n  </body>`n</html>"
}

function Build-CountryPage([string]$content, [string]$bboxKey, [string]$continentBboxKey) {
  $d = Get-HtmlData $content
  $osmSrc = Get-OsmSrc $bboxKey $continentBboxKey
  $css = Get-CSS $d
  $pie = Get-PieChart $d
  $f = $d['facts']; $dt = $d['details']
  $pop = if ($f['Population']) { $f['Population'] } else { '&mdash;' }
  $area = if ($f['Area']) { $f['Area'] } else { '&mdash;' }
  $continent = if ($dt['Continent']) { $dt['Continent'] } else { '&mdash;' }
  $capital = if ($d['capital']) { $d['capital'] } else { '&mdash;' }
  $lang = if ($dt['Language']) { $dt['Language'] } else { '&mdash;' }
  $currency = if ($dt['Currency']) { $dt['Currency'] } else { '&mdash;' }
  $govt = if ($dt['Government']) { $dt['Government'] } else { '&mdash;' }
  $knownFor = $d['knownFor']
  $cityHtml = ''
  foreach ($cl in $d['cityLinks']) {
    $href = $cl.Groups[1].Value; $name = $cl.Groups[2].Value
    $role = if ($name -eq $capital) { 'Capital city' } else { 'City' }
    $cityHtml += "          <a class=`"city-link`" href=`"$href`"><div><span>$role</span><strong>$name</strong></div><em>Open</em></a>`n"
  }
  $citySection = if ($cityHtml) { "        <div>`n          <p class=`"section-label`">Cities</p>`n          <div class=`"city-grid`">`n$cityHtml          </div>`n        </div>" } else { '' }
  $kf = if ($knownFor) { "        <div class=`"known-for`"><span>Known for</span>$knownFor</div>`n" } else { '' }
  $flagHtml = if ($d['flagSrc']) { "<img class=`"flag`" src=`"$($d['flagSrc'])`" alt=`"$($d['title']) flag`">`n            " } else { '' }
  $title = $d['title']; $navHtml = $d['navHtml']; $heroUrl = $d['heroUrl']
  $eyebrow = $d['eyebrow']; $intro = $d['intro']
  return "<!doctype html>`n<html lang=`"en`">`n  <head>`n    <meta charset=`"utf-8`">`n    <meta name=`"viewport`" content=`"width=device-width, initial-scale=1`">`n    <title>$title</title>`n    <style>`n$css`n    </style>`n  </head>`n  <body>`n    <nav class=`"top-menu`" aria-label=`"Location navigation`">`n      $navHtml`n    </nav>`n    <main class=`"slide`">`n      <aside class=`"left-col`">`n        <div class=`"hero`" style=`"background:linear-gradient(180deg,rgba(0,0,0,.08),rgba(0,0,0,.56)),url('$heroUrl') center/cover`">`n          <div>`n            $flagHtml<p class=`"eyebrow`">$eyebrow</p>`n            <h1>$title</h1>`n            <p class=`"intro`">$intro</p>`n          </div>`n        </div>`n        <div class=`"map-wrap`"><iframe src=`"$osmSrc`" loading=`"lazy`" title=`"Map of $title`"></iframe></div>`n      </aside>`n      <section class=`"right-col`" aria-label=`"$title facts`">`n$kf        <div class=`"fact-grid`">`n          <div class=`"fact`"><span>Continent</span><strong>$continent</strong></div>`n          <div class=`"fact`"><span>Population</span><strong>$pop</strong></div>`n          <div class=`"fact`"><span>Population ranking</span><strong>&mdash;</strong></div>`n          <div class=`"fact`"><span>Area</span><strong>$area</strong></div>`n          <div class=`"fact`"><span>Area ranking</span><strong>&mdash;</strong></div>`n          <div class=`"fact`"><span>Capital city</span><strong>$capital</strong></div>`n          <div class=`"fact`"><span>Largest city</span><strong>$capital</strong></div>`n          <div class=`"fact`"><span>Language</span><strong>$lang</strong></div>`n          <div class=`"fact`"><span>Currency</span><strong>$currency</strong></div>`n          <div class=`"fact`"><span>Government</span><strong>$govt</strong></div>`n          <div class=`"fact`"><span>Largest religion</span><strong>&mdash;</strong></div>`n          <div class=`"fact`"><span>Climate</span><strong>&mdash;</strong></div>`n          <div class=`"fact`"><span>Highest point</span><strong>&mdash;</strong></div>`n        </div>`n$pie`n$citySection`n      </section>`n    </main>`n    <footer class=`"site-footer`"><p>&copy; 2026 <a href=`"https://3dfractal.no/`">3D Fractal</a>. All rights reserved.</p></footer>`n  </body>`n</html>"
}

function Build-CityPage([string]$content, [string]$bboxKey, [string]$countryBboxKey) {
  $d = Get-HtmlData $content
  $osmCity = Get-OsmSrc $bboxKey $countryBboxKey
  $osmCountry = Get-OsmSrc $countryBboxKey 'europe'
  $css = Get-CSS $d
  $f = $d['facts']; $dt = $d['details']
  $pop = if ($f['City population']) { $f['City population'] } elseif ($f['Population']) { $f['Population'] } else { '&mdash;' }
  $metro = if ($f['Metro area']) { $f['Metro area'] } else { '&mdash;' }
  $country = if ($dt['Country']) { $dt['Country'] } else { '&mdash;' }
  $knownFor = if ($dt['Known for']) { $dt['Known for'] } elseif ($dt['Character']) { $dt['Character'] } else { $d['eyebrow'] }
  $kf = if ($knownFor) { "        <div class=`"known-for`"><span>Known for</span>$knownFor</div>`n" } else { '' }
  $title = $d['title']; $navHtml = $d['navHtml']; $heroUrl = $d['heroUrl']
  $eyebrow = $d['eyebrow']; $intro = $d['intro']
  return "<!doctype html>`n<html lang=`"en`">`n  <head>`n    <meta charset=`"utf-8`">`n    <meta name=`"viewport`" content=`"width=device-width, initial-scale=1`">`n    <title>$title</title>`n    <style>`n$css`n    </style>`n  </head>`n  <body>`n    <nav class=`"top-menu`" aria-label=`"Location navigation`">`n      $navHtml`n    </nav>`n    <main class=`"slide`">`n      <aside class=`"left-col`">`n        <div class=`"hero`" style=`"background:linear-gradient(180deg,rgba(0,0,0,.04),rgba(0,0,0,.54)),url('$heroUrl') center/cover`">`n          <div>`n            <p class=`"eyebrow`">$eyebrow</p>`n            <h1>$title</h1>`n            <p class=`"intro`">$intro</p>`n          </div>`n        </div>`n        <div class=`"map-wrap`"><iframe src=`"$osmCity`" loading=`"lazy`" title=`"Map of $title`"></iframe></div>`n        <div class=`"map-context`">`n          <p>Location in country</p>`n          <div class=`"map-wrap`"><iframe src=`"$osmCountry`" loading=`"lazy`" title=`"$title in country`"></iframe></div>`n        </div>`n      </aside>`n      <section class=`"right-col`" aria-label=`"$title facts`">`n$kf        <div class=`"fact-grid`">`n          <div class=`"fact`"><span>Country</span><strong>$country</strong></div>`n          <div class=`"fact`"><span>City population</span><strong>$pop</strong></div>`n          <div class=`"fact`"><span>City ranking</span><strong>&mdash;</strong></div>`n          <div class=`"fact`"><span>Metro population</span><strong>$metro</strong></div>`n          <div class=`"fact`"><span>Language</span><strong>&mdash;</strong></div>`n          <div class=`"fact`"><span>Currency</span><strong>&mdash;</strong></div>`n          <div class=`"fact`"><span>Timezone</span><strong>&mdash;</strong></div>`n          <div class=`"fact`"><span>Climate</span><strong>&mdash;</strong></div>`n          <div class=`"fact`"><span>Highest point</span><strong>&mdash;</strong></div>`n          <div class=`"fact`"><span>Main landmark</span><strong>&mdash;</strong></div>`n        </div>`n      </section>`n    </main>`n    <footer class=`"site-footer`"><p>&copy; 2026 <a href=`"https://3dfractal.no/`">3D Fractal</a>. All rights reserved.</p></footer>`n  </body>`n</html>"
}

# ─── MAIN ─────────────────────────────────────────────────────────────────────
$processed = 0; $errors = 0
Write-Host "Processing $BASE ..." -ForegroundColor Cyan

Get-ChildItem $BASE -Directory | ForEach-Object {
  $continentDir = $_; $continentKey = $continentDir.Name
  $continentIndex = Join-Path $continentDir.FullName 'index.html'
  if (Test-Path $continentIndex) {
    try {
      $html = Build-ContinentPage (Get-Content $continentIndex -Raw -Encoding UTF8) $continentKey
      [System.IO.File]::WriteAllText($continentIndex, $html, [System.Text.UTF8Encoding]::new($false))
      $processed++; Write-Host "  [C] $continentKey" -ForegroundColor Green
    } catch { $errors++; Write-Host "  [ERR] $continentKey : $_" -ForegroundColor Red }
  }
  Get-ChildItem $continentDir.FullName -Directory | ForEach-Object {
    $countryDir = $_; $countryKey = $countryDir.Name
    $countryIndex = Join-Path $countryDir.FullName 'index.html'
    if (Test-Path $countryIndex) {
      try {
        $html = Build-CountryPage (Get-Content $countryIndex -Raw -Encoding UTF8) $countryKey $continentKey
        [System.IO.File]::WriteAllText($countryIndex, $html, [System.Text.UTF8Encoding]::new($false))
        $processed++; Write-Host "    [L] $continentKey/$countryKey" -ForegroundColor DarkGreen
      } catch { $errors++; Write-Host "    [ERR] $countryKey : $_" -ForegroundColor Red }
    }
    Get-ChildItem $countryDir.FullName -Filter '*.html' | Where-Object { $_.Name -ne 'index.html' } | ForEach-Object {
      $cityFile = $_.FullName; $cityKey = $_.BaseName
      try {
        $html = Build-CityPage (Get-Content $cityFile -Raw -Encoding UTF8) $cityKey $countryKey
        [System.IO.File]::WriteAllText($cityFile, $html, [System.Text.UTF8Encoding]::new($false))
        $processed++; Write-Host "      [S] $countryKey/$cityKey" -ForegroundColor DarkCyan
      } catch { $errors++; Write-Host "      [ERR] $cityKey : $_" -ForegroundColor Red }
    }
  }
}
Write-Host "`nDone. Processed: $processed  Errors: $errors" -ForegroundColor Cyan
