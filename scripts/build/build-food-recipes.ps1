$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$foodDir = Join-Path $root 'content/categories/food'

function Enc([string]$s) { [Net.WebUtility]::HtmlEncode($s) }

$countries = @{
  'bacalhau'=@(@('Portugal','portugal')); 'baguette'=@(@('France','france')); 'banitsa'=@(@('Bulgaria','bulgaria')); 'barbagiuan'=@(@('Monaco','monaco'))
  'borscht'=@(@('Ukraine','ukraine'),@('Russia','russia')); 'bratwurst'=@(@('Germany','germany')); 'bryndzove-halusky'=@(@('Slovakia','slovakia')); 'byrek'=@(@('Albania','albania'))
  'cepelinai'=@(@('Lithuania','lithuania')); 'cevapi'=@(@('Bosnia and Herzegovina','bosnia-and-herzegovina')); 'draniki'=@(@('Belarus','belarus')); 'farikal'=@(@('Norway','norway'))
  'fish-and-chips'=@(@('United Kingdom','united-kingdom')); 'flija'=@(@('Kosovo','kosovo')); 'fondue'=@(@('Switzerland','switzerland')); 'goulash'=@(@('Hungary','hungary'))
  'grey-peas-with-bacon'=@(@('Latvia','latvia')); 'halloumi'=@(@('Cyprus','cyprus')); 'irish-stew'=@(@('Ireland','ireland')); 'judd-mat-gaardebounen'=@(@('Luxembourg','luxembourg'))
  'karjalanpiirakka'=@(@('Finland','finland')); 'kasknopfle'=@(@('Liechtenstein','liechtenstein')); 'kebab'=@(@('Turkey','turkey')); 'khachapuri'=@(@('Georgia','georgia'))
  'khorovats'=@(@('Armenia','armenia')); 'lamb-soup'=@(@('Iceland','iceland')); 'mamaliga'=@(@('Moldova','moldova')); 'meatballs'=@(@('Sweden','sweden'))
  'moules-frites'=@(@('Belgium','belgium')); 'moussaka'=@(@('Greece','greece')); 'njeguski-prsut'=@(@('Montenegro','montenegro')); 'paella'=@(@('Spain','spain'))
  'pastizzi'=@(@('Malta','malta')); 'peka'=@(@('Croatia','croatia')); 'pierogi'=@(@('Poland','poland')); 'pizza'=@(@('Italy','italy'))
  'pljeskavica'=@(@('Serbia','serbia')); 'plov'=@(@('Azerbaijan','azerbaijan')); 'potica'=@(@('Slovenia','slovenia')); 'roman-pasta'=@(@('Vatican City','vatican-city'))
  'sarmale'=@(@('Romania','romania')); 'sm-rrebr-d'=@(@('Denmark','denmark')); 'street-food'=@(@('Europe','')); 'stroopwafel'=@(@('Netherlands','netherlands'))
  'svickova'=@(@('Czechia','czechia')); 'tavce-gravce'=@(@('North Macedonia','north-macedonia')); 'torta-tre-monti'=@(@('San Marino','san-marino')); 'trinxat'=@(@('Andorra','andorra'))
  'verivorst'=@(@('Estonia','estonia')); 'wiener-schnitzel'=@(@('Austria','austria'))
}
<#
Legacy single-country map kept here as historical reference is intentionally removed.
  'cepelinai'=@('Lithuania','lithuania'); 'cevapi'=@('Bosnia and Herzegovina','bosnia-and-herzegovina'); 'draniki'=@('Belarus','belarus'); 'farikal'=@('Norway','norway')
  'fish-and-chips'=@('United Kingdom','united-kingdom'); 'flija'=@('Kosovo','kosovo'); 'fondue'=@('Switzerland','switzerland'); 'goulash'=@('Hungary','hungary')
  'grey-peas-with-bacon'=@('Latvia','latvia'); 'halloumi'=@('Cyprus','cyprus'); 'irish-stew'=@('Ireland','ireland'); 'judd-mat-gaardebounen'=@('Luxembourg','luxembourg')
  'karjalanpiirakka'=@('Finland','finland'); 'kasknopfle'=@('Liechtenstein','liechtenstein'); 'kebab'=@('Turkey','turkey'); 'khachapuri'=@('Georgia','georgia')
  'khorovats'=@('Armenia','armenia'); 'lamb-soup'=@('Iceland','iceland'); 'mamaliga'=@('Moldova','moldova'); 'meatballs'=@('Sweden','sweden')
  'moules-frites'=@('Belgium','belgium'); 'moussaka'=@('Greece','greece'); 'njeguski-prsut'=@('Montenegro','montenegro'); 'paella'=@('Spain','spain')
  'pastizzi'=@('Malta','malta'); 'peka'=@('Croatia','croatia'); 'pierogi'=@('Poland','poland'); 'pizza'=@('Italy','italy')
  'pljeskavica'=@('Serbia','serbia'); 'plov'=@('Azerbaijan','azerbaijan'); 'potica'=@('Slovenia','slovenia'); 'roman-pasta'=@('Vatican City','vatican-city')
  'sarmale'=@('Romania','romania'); 'sm-rrebr-d'=@('Denmark','denmark'); 'street-food'=@('Europe',''); 'stroopwafel'=@('Netherlands','netherlands')
  'svickova'=@('Czechia','czechia'); 'tavce-gravce'=@('North Macedonia','north-macedonia'); 'torta-tre-monti'=@('San Marino','san-marino'); 'trinxat'=@('Andorra','andorra')
  'verivorst'=@('Estonia','estonia'); 'wiener-schnitzel'=@('Austria','austria')
}
#>

$countries = @{
  'bacalhau'='Portugal|portugal'; 'baguette'='France|france'; 'banitsa'='Bulgaria|bulgaria'; 'barbagiuan'='Monaco|monaco'
  'borscht'='Ukraine|ukraine;Russia|russia'; 'bratwurst'='Germany|germany'; 'bryndzove-halusky'='Slovakia|slovakia'; 'byrek'='Albania|albania'
  'cepelinai'='Lithuania|lithuania'; 'cevapi'='Bosnia and Herzegovina|bosnia-and-herzegovina'; 'draniki'='Belarus|belarus'; 'farikal'='Norway|norway'
  'fish-and-chips'='United Kingdom|united-kingdom'; 'flija'='Kosovo|kosovo'; 'fondue'='Switzerland|switzerland'; 'goulash'='Hungary|hungary'
  'grey-peas-with-bacon'='Latvia|latvia'; 'halloumi'='Cyprus|cyprus'; 'irish-stew'='Ireland|ireland'; 'judd-mat-gaardebounen'='Luxembourg|luxembourg'
  'karjalanpiirakka'='Finland|finland'; 'kasknopfle'='Liechtenstein|liechtenstein'; 'kebab'='Turkey|turkey'; 'khachapuri'='Georgia|georgia'
  'khorovats'='Armenia|armenia'; 'lamb-soup'='Iceland|iceland'; 'mamaliga'='Moldova|moldova'; 'meatballs'='Sweden|sweden'
  'moules-frites'='Belgium|belgium'; 'moussaka'='Greece|greece'; 'njeguski-prsut'='Montenegro|montenegro'; 'paella'='Spain|spain'
  'pastizzi'='Malta|malta'; 'peka'='Croatia|croatia'; 'pierogi'='Poland|poland'; 'pizza'='Italy|italy'
  'pljeskavica'='Serbia|serbia'; 'plov'='Azerbaijan|azerbaijan'; 'potica'='Slovenia|slovenia'; 'roman-pasta'='Vatican City|vatican-city'
  'sarmale'='Romania|romania'; 'sm-rrebr-d'='Denmark|denmark'; 'street-food'='Europe|'; 'stroopwafel'='Netherlands|netherlands'
  'svickova'='Czechia|czechia'; 'tavce-gravce'='North Macedonia|north-macedonia'; 'torta-tre-monti'='San Marino|san-marino'; 'trinxat'='Andorra|andorra'
  'verivorst'='Estonia|estonia'; 'wiener-schnitzel'='Austria|austria'
}

$drinks = @{
  'bacalhau'=@('Vinho verde or white wine','wine');   'baguette'=@('Coffee','coffee');   'banitsa'=@('Black tea','black-tea');   'barbagiuan'=@('Cremant','cremant');   'borscht'=@('Kvass','kvass');   'bratwurst'=@('Beer','beer');   'bryndzove-halusky'=@('Beer','beer');   'byrek'=@('Black tea','black-tea');   'cepelinai'=@('Beer','beer');   'cevapi'=@('Beer','beer');   'draniki'=@('Kvass','kvass');   'farikal'=@('Aquavit','aquavit');   'fish-and-chips'=@('Stout','stout');   'flija'=@('Black tea','black-tea');   'fondue'=@('Wine','wine');   'goulash'=@('Tokaji','tokaji');   'grey-peas-with-bacon'=@('Beer','beer');   'halloumi'=@('Wine','wine');   'irish-stew'=@('Stout','stout');   'judd-mat-gaardebounen'=@('Beer','beer');   'karjalanpiirakka'=@('Coffee','coffee');   'kasknopfle'=@('Beer','beer');   'kebab'=@('Turkish tea','turkish-tea');   'khachapuri'=@('Wine','wine');   'khorovats'=@('Beer','beer');   'lamb-soup'=@('Black tea','black-tea');   'mamaliga'=@('Wine','wine');   'meatballs'=@('Beer','beer');   'moules-frites'=@('Beer','beer');   'moussaka'=@('Ouzo','ouzo');   'njeguski-prsut'=@('Vranac','vranac');   'paella'=@('Sangria','sangria');   'pastizzi'=@('Black tea','black-tea');   'peka'=@('Wine','wine');   'pierogi'=@('Beer','beer');   'pizza'=@('Wine','wine');   'pljeskavica'=@('Beer','beer');   'plov'=@('Black tea','black-tea');   'potica'=@('Coffee','coffee');   'roman-pasta'=@('Wine','wine');   'sarmale'=@('Beer','beer');   'sm-rrebr-d'=@('Aquavit','aquavit');   'street-food'=@('Beer','beer');   'stroopwafel'=@('Coffee','coffee');   'svickova'=@('Beer','beer');   'tavce-gravce'=@('Beer','beer');   'torta-tre-monti'=@('Coffee','coffee');   'trinxat'=@('Wine','wine');   'verivorst'=@('Beer','beer');   'wiener-schnitzel'=@('Beer','beer')
}

$recipes = @(
  @{slug='bacalhau'; title='Bacalhau'; intro='Salt cod with potatoes, onions, olives and olive oil.'; ingredients=@('600 g soaked salt cod','700 g waxy potatoes','2 onions, sliced','2 garlic cloves','Black olives','Parsley and olive oil'); steps=@('Simmer the cod gently until it flakes, then remove skin and bones.','Boil potatoes until tender and slice thickly.','Soften onions and garlic in olive oil.','Layer potatoes, cod and onions, warm through, then finish with olives and parsley.')}
  @{slug='baguette'; title='Baguette'; intro='A crisp French loaf with a light open crumb.'; ingredients=@('500 g bread flour','350 ml water','10 g salt','7 g dry yeast','Extra flour for shaping'); steps=@('Mix flour, water, yeast and salt into a shaggy dough.','Fold during a long rise until airy.','Shape into long loaves and rest until puffy.','Slash and bake hot with steam until deeply golden.')}
  @{slug='banitsa'; title='Banitsa'; intro='Flaky Bulgarian filo pastry with egg and cheese.'; ingredients=@('12 sheets filo pastry','300 g sirene or feta','4 eggs','250 g yogurt','80 g melted butter','Pinch of baking soda'); steps=@('Whisk eggs, yogurt, cheese and baking soda.','Brush filo with butter and add filling.','Roll or layer in a baking dish.','Bake until puffed, crisp and golden.')}
  @{slug='barbagiuan'; title='Barbagiuan'; intro='Small fried pastries filled with chard, herbs and cheese.'; ingredients=@('Pastry dough','250 g chard leaves','150 g ricotta','1 small onion','Parmesan','Oil for frying'); steps=@('Cook onion and chopped chard until dry.','Mix with ricotta and parmesan.','Fill pastry rounds and seal firmly.','Fry until crisp and golden.')}
  @{slug='borscht'; title='Borscht'; intro='A beet-rich soup eaten across Eastern Europe, especially in Ukraine and Russia, with cabbage, potato and sour cream.'; ingredients=@('3 medium beets, peeled','1 carrot, grated or sliced','1 potato, diced','1/4 cabbage, finely shredded','1.2 l beef, chicken or vegetable stock','1 tbsp vinegar or lemon juice','Sour cream and dill'); steps=@('Put the beets in a pot with stock and bring to a gentle boil over medium-high heat. Lower to medium-low and simmer for 20 minutes so the broth turns deep red.','Add carrot, potato and cabbage. Keep the soup at a quiet simmer, not a hard boil, for 20-25 minutes until the potato is tender and the cabbage has softened.','Stir in vinegar or lemon juice, then season with salt and black pepper. Simmer 5 minutes more on low heat so the flavor settles.','Let the soup stand off the heat for 10 minutes before serving. Spoon into bowls and finish with sour cream and dill.')}
  @{slug='bratwurst'; title='Bratwurst'; intro='Pan-browned sausages with sauerkraut and mustard.'; ingredients=@('6 bratwurst','300 g sauerkraut','1 onion','1 tbsp butter','Mustard','Bread or potatoes'); steps=@('Brown bratwurst slowly in a skillet.','Cook onion in butter until soft.','Warm sauerkraut with the onion.','Serve sausages with sauerkraut, mustard and bread.')}
  @{slug='bryndzove-halusky'; title='Bryndzové halušky'; intro='Slovak potato dumplings with sheep cheese and bacon.'; ingredients=@('600 g potatoes','200 g flour','200 g bryndza or sheep cheese','150 g bacon','Chives','Salt'); steps=@('Grate potatoes and mix with flour and salt.','Drop small dumplings into boiling water.','Fry bacon until crisp.','Toss dumplings with cheese, bacon fat, bacon and chives.')}
  @{slug='byrek'; title='Byrek'; intro='Flaky Balkan pie with spinach and cheese.'; ingredients=@('Filo pastry','300 g spinach','200 g feta','1 onion','2 eggs','Butter or oil'); steps=@('Cook spinach and onion until dry.','Mix with feta and eggs.','Layer filo with butter and filling.','Bake until crisp and golden.')}
  @{slug='cepelinai'; title='Cepelinai'; intro='Lithuanian potato dumplings with meat filling.'; ingredients=@('1.2 kg potatoes','250 g minced pork','1 onion','Sour cream','Bacon','Salt and pepper'); steps=@('Grate potatoes and squeeze out liquid.','Season pork with onion, salt and pepper.','Shape potato around the filling.','Simmer gently and serve with bacon and sour cream.')}
  @{slug='cevapi'; title='Cevapi'; intro='Grilled Balkan minced meat sausages in flatbread.'; ingredients=@('500 g minced beef/lamb mix','2 garlic cloves','1 tsp paprika','Flatbread','Onion','Ajvar and kaymak'); steps=@('Mix meat with garlic, paprika, salt and pepper.','Shape into small sausages and chill.','Grill until browned and juicy.','Serve in warm flatbread with onion, ajvar and kaymak.')}
  @{slug='draniki'; title='Draniki'; intro='Crisp potato pancakes with sour cream.'; ingredients=@('700 g potatoes','1 onion','1 egg','2 tbsp flour','Sour cream','Dill'); steps=@('Grate potatoes and onion, then squeeze lightly.','Mix with egg, flour, salt and pepper.','Fry spoonfuls until crisp on both sides.','Serve hot with sour cream and dill.')}
  @{slug='farikal'; title='Fårikål'; intro='Norwegian lamb and cabbage stew.'; ingredients=@('1 kg lamb shoulder pieces','1 cabbage','2 tsp black peppercorns','Salt','Water','Boiled potatoes'); steps=@('Layer lamb and cabbage in a heavy pot.','Add salt, peppercorns and a little water.','Simmer slowly until lamb is tender.','Serve with potatoes and broth.')}
  @{slug='fish-and-chips'; title='Fish and chips'; intro='Crisp battered fish with chips and tartar sauce.'; ingredients=@('4 cod fillets','150 g flour','200 ml cold beer or sparkling water','Potatoes for chips','Peas','Tartar sauce'); steps=@('Cut potatoes into chips and fry until golden.','Whisk flour with cold liquid and salt.','Dip fish in batter and fry until crisp.','Serve with chips, peas, lemon and tartar sauce.')}
  @{slug='flija'; title='Flija'; intro='Layered Balkan pancake pie served with cream.'; ingredients=@('500 g flour','650 ml water','Salt','200 g cream','100 g butter','Yogurt to serve'); steps=@('Whisk flour, water and salt into thin batter.','Bake thin layers one at a time under high heat.','Brush each layer with cream and butter.','Cut into wedges and serve warm.')}
  @{slug='fondue'; title='Fondue'; intro='Swiss melted cheese for dipping bread and potatoes.'; ingredients=@('300 g Gruyère','300 g Emmental','1 garlic clove','250 ml white wine','1 tbsp cornstarch','Bread cubes'); steps=@('Rub the pot with garlic.','Warm wine and melt grated cheese gradually.','Stir in cornstarch slurry until smooth.','Keep warm and dip bread or potatoes.')}
  @{slug='goulash'; title='Goulash'; intro='Paprika-rich Hungarian beef stew.'; ingredients=@('700 g beef chuck','2 onions','2 tbsp sweet paprika','2 carrots','2 potatoes','Beef stock'); steps=@('Brown beef and soften onions.','Stir in paprika briefly without burning.','Add stock and simmer until beef is tender.','Add carrots and potatoes and cook through.')}
  @{slug='grey-peas-with-bacon'; title='Grey peas with bacon'; intro='Latvian grey peas with crisp bacon and onion.'; ingredients=@('400 g soaked grey peas','200 g smoked bacon','1 onion','Bay leaf','Salt','Rye bread'); steps=@('Simmer soaked peas with bay until tender.','Dice and fry bacon until crisp.','Cook onion in the bacon fat.','Toss peas with bacon and onion and serve warm.')}
  @{slug='halloumi'; title='Halloumi'; intro='Grilled halloumi with lemon, herbs and vegetables.'; ingredients=@('300 g halloumi','1 lemon','Tomatoes','Cucumber','Mint','Olive oil'); steps=@('Slice halloumi into thick pieces.','Pat dry and grill or fry until golden.','Toss vegetables with lemon and olive oil.','Serve halloumi hot with mint and salad.')}
  @{slug='irish-stew'; title='Irish stew'; intro='Simple lamb stew with potatoes and root vegetables.'; ingredients=@('800 g lamb shoulder','700 g potatoes','3 carrots','2 onions','Stock','Parsley'); steps=@('Brown lamb lightly in a pot.','Add onions, carrots, potatoes and stock.','Simmer until lamb and potatoes are tender.','Season and finish with parsley.')}
  @{slug='judd-mat-gaardebounen'; title='Judd mat Gaardebounen'; intro='Smoked pork with broad beans and potatoes.'; ingredients=@('700 g smoked pork collar','500 g broad beans','1 onion','Cream','Potatoes','Parsley'); steps=@('Simmer smoked pork until tender.','Cook broad beans with onion.','Add a little cream and seasoning.','Slice pork and serve with beans and potatoes.')}
  @{slug='karjalanpiirakka'; title='Karjalanpiirakka'; intro='Karelian rye pies with rice filling and egg butter.'; ingredients=@('Rye flour dough','300 g cooked rice porridge','2 eggs','80 g butter','Salt','Milk for brushing'); steps=@('Roll rye dough into thin ovals.','Fill with rice porridge and crimp edges.','Bake hot until the crust is firm.','Brush with butter and serve with egg butter.')}
  @{slug='kasknopfle'; title='Käsknöpfle'; intro='Cheese spaetzle with caramelized onions.'; ingredients=@('400 g flour','4 eggs','150 ml milk','250 g grated cheese','3 onions','Butter'); steps=@('Mix flour, eggs, milk and salt into batter.','Press into boiling water to make small dumplings.','Caramelize onions in butter.','Layer dumplings with cheese and top with onions.')}
  @{slug='kebab'; title='Kebab'; intro='Grilled meat with flatbread, salad and sauce.'; ingredients=@('600 g sliced lamb or chicken','Yogurt','Garlic','Cumin and paprika','Flatbread','Salad and sauces'); steps=@('Marinate meat with yogurt, garlic and spices.','Grill or sear until browned.','Warm flatbread and prepare salad.','Serve meat with sauces and vegetables.')}
  @{slug='khachapuri'; title='Khachapuri'; intro='Georgian cheese bread with egg and butter.'; ingredients=@('Bread dough','300 g sulguni/mozzarella mix','1 egg yolk','Butter','Flour','Salt'); steps=@('Shape dough into a boat.','Fill with grated cheese.','Bake until the bread is golden.','Add egg yolk and butter while hot.')}
  @{slug='khorovats'; title='Khorovats'; intro='Armenian grilled meat skewers with vegetables.'; ingredients=@('700 g pork or lamb','Onion','Paprika','Tomatoes','Peppers','Lavash and herbs'); steps=@('Marinate meat with onion, salt and spices.','Thread meat and vegetables onto skewers.','Grill over high heat until charred and juicy.','Serve with lavash and fresh herbs.')}
  @{slug='lamb-soup'; title='Lamb soup'; intro='Icelandic lamb soup with root vegetables.'; ingredients=@('700 g lamb pieces','Potatoes','Carrots','Rutabaga','Cabbage','Parsley'); steps=@('Simmer lamb in water until the broth is rich.','Skim, season and add root vegetables.','Cook until vegetables are tender.','Finish with cabbage and parsley.')}
  @{slug='mamaliga'; title='Mămăligă'; intro='Cornmeal polenta with cheese and sour cream.'; ingredients=@('250 g cornmeal','1 l water','Salt','Butter','Sour cream','Brined cheese'); steps=@('Bring salted water to a boil.','Whisk in cornmeal gradually.','Cook, stirring, until thick and smooth.','Serve with butter, cheese and sour cream.')}
  @{slug='meatballs'; title='Meatballs'; intro='Swedish meatballs with gravy and lingonberry.'; ingredients=@('500 g minced beef/pork','Breadcrumbs','Milk','1 egg','Cream','Lingonberry jam'); steps=@('Soak breadcrumbs in milk.','Mix with meat, egg, salt and pepper.','Roll and brown meatballs.','Make cream gravy in the pan and serve with potatoes.')}
  @{slug='moules-frites'; title='Moules-frites'; intro='Mussels steamed with wine and served with fries.'; ingredients=@('1.5 kg mussels','White wine','Shallot','Garlic','Parsley','Fries'); steps=@('Clean mussels and discard any open ones that do not close.','Cook shallot and garlic, then add wine.','Steam mussels until open.','Serve with parsley, broth and fries.')}
  @{slug='moussaka'; title='Moussaka'; intro='Layered eggplant, meat sauce and béchamel.'; ingredients=@('2 eggplants','500 g minced lamb/beef','Tomato sauce','Cinnamon','Béchamel','Cheese'); steps=@('Roast or fry eggplant slices.','Cook meat sauce with tomato and spice.','Layer eggplant and sauce in a dish.','Top with béchamel and bake until browned.')}
  @{slug='njeguski-prsut'; title='Njeguški pršut'; intro='Dry-cured ham served with cheese and bread.'; ingredients=@('Thin sliced pršut','Local cheese','Olives','Figs','Bread','Olive oil'); steps=@('Bring pršut to room temperature.','Slice cheese and bread.','Arrange ham loosely on a board.','Serve with olives, figs and a little olive oil.')}
  @{slug='paella'; title='Paella'; intro='Saffron rice with seafood, chicken and vegetables.'; ingredients=@('400 g paella rice','Saffron','Stock','Shrimp and mussels','Chicken pieces','Peas and lemon'); steps=@('Brown chicken and aromatics in a paella pan.','Add rice, saffron and stock.','Arrange seafood and simmer without stirring.','Rest briefly and serve with lemon.')}
  @{slug='pastizzi'; title='Pastizzi'; intro='Maltese flaky pastries with ricotta or peas.'; ingredients=@('Puff pastry','250 g ricotta','Cooked peas','Egg','Black pepper','Sesame optional'); steps=@('Mix ricotta or peas with egg and seasoning.','Cut pastry into rounds or squares.','Fill and fold into pastizzi shapes.','Bake until flaky and golden.')}
  @{slug='peka'; title='Peka'; intro='Croatian slow-roasted meat and potatoes.'; ingredients=@('1 kg lamb or veal','Potatoes','Onions','Carrots','Garlic','Rosemary and olive oil'); steps=@('Season meat and vegetables generously.','Place in a heavy pan with olive oil and herbs.','Roast covered until tender.','Uncover briefly to brown and serve with pan juices.')}
  @{slug='pierogi'; title='Pierogi'; intro='Polish dumplings with potato-cheese filling.'; ingredients=@('Dumpling dough','500 g potatoes','200 g twaróg or cottage cheese','Onion','Butter','Sour cream'); steps=@('Mash potatoes with cheese and onion.','Roll dough and cut circles.','Fill, seal and boil dumplings.','Pan-fry in butter and serve with sour cream.')}
  @{slug='pizza'; title='Pizza'; intro='Neapolitan-style pizza with tomato, mozzarella and basil.'; ingredients=@('Pizza dough','Tomato sauce','Mozzarella','Basil','Olive oil','Salt'); steps=@('Stretch dough gently by hand.','Add tomato, mozzarella and a little oil.','Bake as hot as possible until blistered.','Finish with basil and serve immediately.')}
  @{slug='pljeskavica'; title='Pljeskavica'; intro='Balkan grilled patty in flatbread with ajvar.'; ingredients=@('600 g minced beef/pork','Onion','Paprika','Flatbread','Ajvar','Kajmak or yogurt'); steps=@('Season meat and form wide patties.','Chill so the patties hold shape.','Grill until browned and juicy.','Serve in flatbread with ajvar, onion and kajmak.')}
  @{slug='plov'; title='Plov'; intro='Azerbaijani saffron rice with lamb and dried fruit.'; ingredients=@('400 g basmati rice','500 g lamb','Saffron','Onions','Dried apricots and raisins','Butter'); steps=@('Parboil rice and drain.','Brown lamb with onions.','Steam rice with saffron and butter.','Serve rice topped with lamb and dried fruit.')}
  @{slug='potica'; title='Potica'; intro='Slovenian rolled walnut cake.'; ingredients=@('Sweet yeast dough','300 g walnuts','Milk','Honey or sugar','Butter','Cinnamon'); steps=@('Roll dough into a thin rectangle.','Spread walnut filling evenly.','Roll tightly and place in a tin.','Bake until golden and slice when cool.')}
  @{slug='roman-pasta'; title='Roman pasta'; intro='Creamy Roman pasta with cheese and black pepper.'; ingredients=@('400 g pasta','Pecorino Romano','Black pepper','Pasta water','Salt','Optional guanciale'); steps=@('Cook pasta until just al dente.','Toast black pepper in a pan.','Emulsify cheese with hot pasta water.','Toss pasta until glossy and serve immediately.')}
  @{slug='sarmale'; title='Sarmale'; intro='Cabbage rolls stuffed with meat and rice.'; ingredients=@('Pickled cabbage leaves','500 g minced pork','100 g rice','Onion','Tomato sauce','Sour cream'); steps=@('Mix meat, rice, onion and seasoning.','Roll filling in cabbage leaves.','Layer rolls with tomato sauce in a pot.','Simmer slowly and serve with sour cream.')}
  @{slug='sm-rrebr-d'; title='Smørrebrød'; intro='Danish open-faced rye sandwiches.'; ingredients=@('Rye bread','Butter','Pickled herring or shrimp','Egg','Radish','Dill and onion'); steps=@('Butter slices of rye bread.','Add fish, egg or other topping neatly.','Garnish with radish, onion and dill.','Serve chilled as open sandwiches.')}
  @{slug='street-food'; title='Street Food'; intro='A flexible street-food plate with grilled bites, bread and sauces.'; ingredients=@('Flatbread or buns','Grilled meat or vegetables','Crisp potatoes','Fresh herbs','Pickles','Sauces'); steps=@('Cook the main filling hot and well seasoned.','Warm bread and prepare crunchy sides.','Add pickles, herbs and sauce.','Serve immediately while textures contrast.')}
  @{slug='stroopwafel'; title='Stroopwafel'; intro='Dutch caramel waffle cookies.'; ingredients=@('Waffle dough','Butter','Brown sugar','Syrup','Cinnamon','Pinch of salt'); steps=@('Cook thin waffles in a waffle iron.','Split while warm if thick enough.','Simmer syrup, sugar, butter and cinnamon.','Sandwich caramel between waffle halves.')}
  @{slug='svickova'; title='Svíčková'; intro='Czech beef with creamy root vegetable sauce.'; ingredients=@('700 g beef sirloin','Carrot and celeriac','Onion','Cream','Bread dumplings','Cranberry'); steps=@('Braise beef with root vegetables until tender.','Blend vegetables with broth and cream.','Slice beef and warm in sauce.','Serve with dumplings and cranberry.')}
  @{slug='tavce-gravce'; title='Tavče gravče'; intro='Macedonian baked beans with paprika and onions.'; ingredients=@('500 g white beans','2 onions','Paprika','Oil','Mint or parsley','Bread'); steps=@('Soak and simmer beans until tender.','Cook onions with paprika in oil.','Combine in a clay dish.','Bake until thick and browned on top.')}
  @{slug='torta-tre-monti'; title='Torta Tre Monti'; intro='Layered wafer cake with chocolate hazelnut cream.'; ingredients=@('Wafer sheets','Chocolate','Hazelnut cream','Butter','Cocoa','Chopped hazelnuts'); steps=@('Melt chocolate with butter and hazelnut cream.','Spread thinly between wafer sheets.','Press and chill until set.','Slice into neat wedges.')}
  @{slug='trinxat'; title='Trinxat'; intro='Andorran cabbage, potato and bacon cake.'; ingredients=@('600 g potatoes','1 small cabbage','150 g bacon','Garlic','Olive oil','Salt'); steps=@('Boil potatoes and cabbage until tender.','Fry bacon and garlic.','Mash vegetables with bacon fat.','Press into a skillet and brown like a cake.')}
  @{slug='verivorst'; title='Verivorst'; intro='Estonian blood sausage with sauerkraut and potatoes.'; ingredients=@('Verivorst sausages','Sauerkraut','Potatoes','Lingonberry jam','Mustard','Butter'); steps=@('Roast sausages gently until hot and glossy.','Warm sauerkraut with a little butter.','Boil or roast potatoes.','Serve with lingonberry jam and mustard.')}
  @{slug='wiener-schnitzel'; title='Wiener schnitzel'; intro='Thin crisp breaded cutlet with lemon.'; ingredients=@('4 veal or pork cutlets','Flour','2 eggs','Breadcrumbs','Lemon','Potato salad'); steps=@('Pound cutlets thin and season.','Coat in flour, egg and breadcrumbs.','Fry in hot fat until puffed and golden.','Serve with lemon and potato salad.')}
)

$indexPath = Join-Path $foodDir 'index.html'
$index = Get-Content $indexPath -Raw -Encoding UTF8
$index = $index -replace '<h2>Food Topics</h2><a class="topic-link" href="../drinks/index.html">Drinks</a>', '<h2>Recepts</h2>'
$index = $index -replace '<p>Food topic on OneSliders\.</p>', ''
$index = $index -replace 'aria-label="Food Topics"', 'aria-label="Recepts"'
[IO.File]::WriteAllText($indexPath, $index, [Text.UTF8Encoding]::new($false))

function CountryLinks($countryList) {
  (($countryList -split ';') | ForEach-Object {
    $parts = $_ -split '\|', 2
    if ($parts[1] -eq '') { '<a class="topic-country" href="../../locations/europe/"><span>' + (Enc $parts[0]) + '</span></a>' }
    else { '<a class="topic-country" href="../../locations/europe/' + $parts[1] + '/index.html"><img src="../../locations/europe/' + $parts[1] + '/img/flag.svg" alt=""> ' + (Enc $parts[0]) + '</a>' }
  }) -join ''
}

function DrinkLink($drink) {
  '<a class="recipe-drink-card" href="../drinks/' + $drink[1] + '.html"><img src="../drinks/img/' + $drink[1] + '-mini.png" alt="" loading="lazy"><span>Drink</span><strong>' + (Enc $drink[0]) + '</strong></a>'
}

function DetailStep([string]$slug, [int]$i, [string]$step) {
  if ($slug -eq 'borscht') { return $step }
  $lower = $step.ToLowerInvariant()
  if ($lower -match 'mix|whisk|marinate|season') {
    return "$step Work in a bowl for 2-3 minutes until the mixture looks even, then let it rest for 10-20 minutes so the flour, meat or spices hydrate properly."
  }
  if ($lower -match 'boil|simmer|cook.*water|drop') {
    return "$step Start over medium-high heat until the water or broth is bubbling, then lower to medium or medium-low and cook gently for 10-25 minutes, depending on size, until tender but not falling apart."
  }
  if ($lower -match 'fry|brown|grill|sear') {
    return "$step Use medium-high heat to get color, then lower to medium so the inside cooks through without burning. Turn only when the first side has a firm golden crust."
  }
  if ($lower -match 'bake|roast') {
    return "$step Bake in a fully preheated oven, usually 190-220C, until the top is golden and the center is hot; start checking after 20 minutes for pastries and after 45 minutes for larger roasts."
  }
  if ($lower -match 'layer|shape|fill|roll|coat') {
    return "$step Keep the pieces even in size and seal edges well. If the dough or filling feels soft, chill it for 10 minutes before cooking so it holds its shape."
  }
  if ($lower -match 'serve|finish|top') {
    return "$step Taste once more before serving. Add salt, acid, herbs or a spoon of sauce at the end while the dish is still hot."
  }
  if ($i -eq 0) {
    return "$step Prepare this first and keep the heat moderate; rushing the first stage usually gives uneven texture later."
  }
  return "$step Continue gently and check texture rather than only the clock; the dish is ready when the main ingredient is tender and well seasoned."
}

foreach ($r in $recipes) {
  $slug = $r.slug
  $country = $countries[$slug]
  $drink = $drinks[$slug]
  $ingredients = ($r.ingredients | ForEach-Object { '<li>' + (Enc $_) + '</li>' }) -join ''
  $stepItems = @()
  for ($si = 0; $si -lt $r.steps.Count; $si++) {
    $stepItems += '<li>' + (Enc (DetailStep $slug $si $r.steps[$si])) + '</li>'
  }
  $steps = $stepItems -join ''
  $countryHtml = CountryLinks $country
  $drinkHtml = DrinkLink $drink
  $title = Enc $r.title
  $intro = Enc $r.intro
  $html = @"
<!doctype html>
<html lang="en">
<head>
  <!-- OneSlider core v4 -->
  <link rel="stylesheet" href="../../../assets/css/oneslider-core.css">
  <script src="../../../assets/js/oneslider-core.js"></script>
  <link rel="stylesheet" href="../../../assets/css/categories.css">
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta property="og:image" content="/content/categories/food/img/$slug-hero.png">
  <link rel="icon" href="../../../assets/icons/favicon.ico" sizes="any">
  <link rel="icon" href="../../../assets/icons/one-sliders-icon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="../../../assets/icons/apple-touch-icon.png">
  <link rel="manifest" href="../../../assets/icons/site.webmanifest">
  <meta name="theme-color" content="#0d2137">
  <title>$title | Recipe | OneSliders</title>
  <style>
    body{margin:0;font-family:Arial,Helvetica,sans-serif;background:#f7faf7;color:#111922}.food-topic{max-width:1180px;margin:0 auto;padding:20px}.food-topic__hero{min-height:320px;border-radius:8px;padding:28px;display:grid;align-content:end;color:white;background:linear-gradient(180deg,rgba(0,0,0,.12),rgba(0,0,0,.68)),url('/content/categories/food/img/$slug-hero.png') center/cover}.food-topic__hero p{max-width:760px;font-size:18px;line-height:1.35}.eyebrow{margin:0 0 8px;color:#9ee6b7;text-transform:uppercase;font-weight:800;font-size:13px}.food-topic h1{font-size:clamp(42px,7vw,82px);line-height:.95;margin:0}.food-topic__panel{margin-top:12px;display:grid;grid-template-columns:1fr 1fr;gap:12px}.topic-card{background:#fff;border:1px solid rgba(17,25,34,.12);border-radius:8px;padding:18px}.topic-card--wide{grid-column:1/-1}.topic-card h2{margin-top:0}.recipe-list{margin:0;padding-left:20px;line-height:1.58}.recipe-list li+li{margin-top:8px}.topic-countries{display:flex;flex-wrap:wrap;gap:8px}.topic-country{display:inline-flex;align-items:center;gap:7px;padding:7px 10px;border:1px solid rgba(17,25,34,.12);border-radius:999px;text-decoration:none;background:#fff;color:#111922;font-weight:800}.topic-country img{width:22px;height:15px;object-fit:cover}.recipe-drink-card{display:grid;grid-template-columns:96px 1fr;gap:12px;align-items:center;text-decoration:none;color:#111922;border:1px solid rgba(17,25,34,.12);border-radius:8px;background:#fff;overflow:hidden}.recipe-drink-card img{width:96px;height:72px;object-fit:cover}.recipe-drink-card span{display:block;color:#47515c;font-size:12px;font-weight:800;text-transform:uppercase}.recipe-drink-card strong{display:block;margin-top:3px;font-size:18px}.top-menu{position:sticky;top:0;z-index:2;background:rgba(247,250,247,.94);border-bottom:1px solid rgba(17,25,34,.12);display:flex;gap:8px;padding:8px 20px}.top-menu a{color:#111922;text-decoration:none;font-weight:800;padding:8px 10px;border-radius:999px}.top-menu a:hover{background:#0f8d5f;color:white}@media(max-width:800px){.food-topic__panel{grid-template-columns:1fr}.topic-card--wide{grid-column:auto}}
  </style>
</head>
<body>
  <nav class="top-menu" aria-label="Category navigation"><a href="../../events/index.html">Events</a><a href="../../locations/index.html">Locations</a><a href="../index.html">Categories</a><a href="index.html">Food</a></nav>
  <main class="food-topic">
    <header class="food-topic__hero"><div><p class="eyebrow">Recipe</p><h1>$title</h1><p>$intro</p></div></header>
    <section class="food-topic__panel">
      <div class="topic-card"><h2>Ingredients</h2><ul class="recipe-list">$ingredients</ul></div>
      <div class="topic-card"><h2>How to make it</h2><ol class="recipe-list">$steps</ol></div>
      <div class="topic-card"><h2>Where it is eaten</h2><div class="topic-countries">$countryHtml</div></div>
      <div class="topic-card"><h2>Goes well with</h2>$drinkHtml</div>
      <div class="topic-card topic-card--wide"><h2>Serving note</h2><p>Keep the plate simple and let the main texture lead: crisp pastry, tender stew, glossy sauce or fresh garnish. This page is a compact cooking guide, not a long article.</p></div>
    </section>
  </main>
</body>
</html>
"@
  [IO.File]::WriteAllText((Join-Path $foodDir "$slug.html"), $html, [Text.UTF8Encoding]::new($false))
}

"rebuilt_recipes=$($recipes.Count)"
