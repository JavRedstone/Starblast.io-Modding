const gameSkip = 30;
const playersReq = 1;

const shipTier = 6;
const shipType = shipTier * 100 + 1;

const maps = [
	{
		name: "X",
		author: "JavRedstone",
		map: "999999999999999999999999999999999999999999999999999999999999\n"+
			"977999999999999999999999999999999999999999999999999999999779\n"+
			"975799777777777799999                  999997777777777997579\n"+
			"99757997555555799  99                  99  99755555579975799\n"+
			"9997579975335799                            9975335799757999\n"+
			"999975799755799                              997557997579999\n"+
			"99799757997799       99              99       99779975799799\n"+
			"9977997579999         99            99         9799757997799\n"+
			"997579975799           99          99           997579975799\n"+
			"9975579975799           99        99           9975799755799\n"+
			"99753579975799           999    999           99757997535799\n"+
			"997535799975799           99    99           997579997535799\n"+
			"99755799 9975799                            9975799 99755799\n"+
			"9975799   9975799                          9975799   9975799\n"+
			"997799     9975799                        9975799     997799\n"+
			"99799       9975799                      9975799       99799\n"+
			"9999         997799      9999999999      997799         9999\n"+
			"999           9999        97777779        9999           999\n"+
			"999            99          975579          99            999\n"+
			"9999                        9779                        9999\n"+
			"9999                         99                         9999\n"+
			"99    9              9999          9999              9    99\n"+
			"99    99             9779          9779             99    99\n"+
			"99     99            9779          9779            99     99\n"+
			"99      99           9999          9999           99      99\n"+
			"99       99     9                          9     99       99\n"+
			"99        99    99                        99    99        99\n"+
			"99        99    979          99          979    99        99\n"+
			"99              9779        9999        9779              99\n"+
			"99              97579      997799      97579              99\n"+
			"99              97579      997799      97579              99\n"+
			"99              9779        9999        9779              99\n"+
			"99        99    979          99          979    99        99\n"+
			"99        99    99                        99    99        99\n"+
			"99       99     9                          9     99       99\n"+
			"99      99           9999          9999           99      99\n"+
			"99     99            9779          9779            99     99\n"+
			"99    99             9779          9779             99    99\n"+
			"99    9              9999          9999              9    99\n"+
			"9999                         99                         9999\n"+
			"9999                        9779                        9999\n"+
			"999            99          975579          99            999\n"+
			"999           9999        97777779        9999           999\n"+
			"9999         997799      9999999999      997799         9999\n"+
			"99799       9975799                      9975799       99799\n"+
			"997799     9975799                        9975799     997799\n"+
			"9975799   9975799                          9975799   9975799\n"+
			"99755799 9975799                            9975799 99755799\n"+
			"997535799975799           99    99           997579997535799\n"+
			"99753579975799           999    999           99757997535799\n"+
			"9975579975799           99        99           9975799755799\n"+
			"997579975799           99          99           997579975799\n"+
			"9977997579999         99            99         9999757997799\n"+
			"99799757997799       99              99       99779975799799\n"+
			"999975799755799                              997557997579999\n"+
			"9997579975335799                            9975335799757999\n"+
			"99757997555555799  99                  99  99755555579975799\n"+
			"975799777777777799999                  999997777777777997579\n"+
			"977999999999999999999999999999999999999999999999999999999779\n"+
			"999999999999999999999999999999999999999999999999999999999999",
		shipSpawn: [
			{ x: -270, y: 0 },
			{ x: 0, y: 270 },
			{ x: 270, y: 0 },
			{ x: 0, y: -270 }
		],
		bedSpawn: [
			{ x: -220, y: 0 },
			{ x: 0, y: 220 },
			{ x: 220, y: 0 },
			{ x: 0, y: -220 }
		]
	},
	{
		name: "Arena",
		author: "JavRedstone",
		map: "767775757775767657999999999999999999999999776665756657667676\n"+
			"676676565557765655799999999999999999999997577567767555657765\n"+
			"7766576757566755676699                9976775677775575565565\n"+
			"56777757755676667667599              99776556657565577675757\n"+
			"675566665755557757667599            997755567776765775775557\n"+
			"7567777576775557675755599          9977566666576675557776567\n"+
			"57657577655776665656765699        99577555757765767757667576\n"+
			"756756799999975755756756799      996556767776579999995755675\n"+
			"77766769    996565567775559      976667657576799    95776565\n"+
			"76676759 999 99666766577569      95576577567799 999 97777765\n"+
			"77667569 9799 9967655557569      9577765675699 9979 97756565\n"+
			"75576769 99799 996776775679      965776565599 99799 97677776\n"+
			"677567699 99799 96755675569      97557556679 99799 997567657\n"+
			"5656555699 9979 96775775659      97575657569 9799 9975767766\n"+
			"67565556799 999 96667657579      97566676569 999 99566577667\n"+
			"766656557799    97577657759      96555657579    995765567576\n"+
			"676665557579999996766655999      999777556599977955557676766\n"+
			"5767767577776657599999999          9999999956655777566567655\n"+
			"955667565767567779                        966666775657667669\n"+
			"996565756656757579                        966766765766566699\n"+
			"999675566766775559                        967565665767777999\n"+
			"999965667555665659   9999          9999   966555757556679999\n"+
			"99 996576565557659   977999      999779   966676655576599 99\n"+
			"99  99676677675759   975579      975579   96657656665799  99\n"+
			"99   9967655775599   995579      975599   9957566576599   99\n"+
			"99    99656567579     97799      99779     95757677699    99\n"+
			"99     9999999999     9999        9999     9999999999     99\n"+
			"99                                                        99\n"+
			"99                           99                           99\n"+
			"99                          9779                          99\n"+
			"99                          9779                          99\n"+
			"99                           99                           99\n"+
			"99                                                        99\n"+
			"99     9999999999     9999        9999     9999999999     99\n"+
			"99    99657677779     97799      99779     96566656599    99\n"+
			"99   9956565755699   995579      975599   9965555665699   99\n"+
			"99  99565667576659   975579      975579   95576667766599  99\n"+
			"99 996575657667779   977999      999779   966666575757599 99\n"+
			"999976667555567759   9999          9999   965755775777569999\n"+
			"999766757777676579                        957555567556656999\n"+
			"996775567665766659                        955575776557655699\n"+
			"955667565777666579                        977777676666775769\n"+
			"5775767756666757799999999          9999999956775566775655775\n"+
			"657765557669999995665567999      999555756799999957675666666\n"+
			"757765575799    95575565579      95565767759    995565565556\n"+
			"65657666599 999 95556565559      97656775679 999 99567666677\n"+
			"7677556799 9979 95655777559      96577755669 9799 9977666666\n"+
			"657765599 99799 95665775569      97566766669 99799 997767657\n"+
			"67566559 99799 996565766669      965666655599 99799 97567667\n"+
			"67775759 9799 9967555757559      9765775667699 9979 96565655\n"+
			"75766759 999 99756565757659      96757577556799 999 96566577\n"+
			"57767659    997767755556759      977577765575699    95557677\n"+
			"675676699999975767575556699      995565565757779999995776755\n"+
			"75575566765566567575765799        99757665577766576565566677\n"+
			"6567767566757767766655699          9966676757677576557765775\n"+
			"676575566677665755665599            997566667777657566765577\n"+
			"67565565656557566556699              99767767555665556755567\n"+
			"7677565676666667766799                9976776766777756657656\n"+
			"656765665655565656699999999999999999999996766657567777675677\n"+
			"566757765576765566999999999999999999999999557565556667777666",
		shipSpawn: [
			{ x: -270, y: 0 },
			{ x: 0, y: 270 },
			{ x: 270, y: 0 },
			{ x: 0, y: -270 }
		],
		bedSpawn: [
			{ x: -220, y: 0 },
			{ x: 0, y: 220 },
			{ x: 220, y: 0 },
			{ x: 0, y: -220 }
		]
	}
];
const objects = {
  bed: {
    obj: "https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/starblast_bed_wars/starblast_bed_final.obj",
    emissives: [
      "https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/starblast_bed_wars/bed_emissive1_final.png",
      "https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/starblast_bed_wars/bed_emissive2_final.png",
      "https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/starblast_bed_wars/bed_emissive3_final.png",
      "https://raw.githubusercontent.com/JavRedstone/Starblast.io-Modding/main/utilities/starblast_bed_wars/bed_emissive4_final.png"
    ],
    physics: {
      mass: 500,
      shape: [0,0,0,0,0,0,0,0,0,0,0,0,0,1.425,1.459,1.517,1.61,1.732,1.935,2.204,2.615,3.317,4.243,4.206,4.071,4.007,4.071,4.206,4.243,3.317,2.615,2.204,1.935,1.732,1.61,1.517,1.459,1.425,1.414,0,0,0,0,0,0,0,0,0,0,0],
      fixed: true
    },
    depth: 0,
    scale: 10
  }
};
const funcShips = {
  waiter: '{"name":"Waiter","level":1,"model":1,"size":0.1,"zoom":0.1,"next":[],"specs":{"shield":{"capacity":[100,100],"reload":[100,100]},"generator":{"capacity":[1,1],"reload":[1,1]},"ship":{"mass":0,"speed":[1,1],"rotation":[1,1],"acceleration":[1,1]}},"bodies":{"main":{"section_segments":1,"offset":{"x":0,"y":0,"z":0},"position":{"x":[1,0],"y":[0,0],"z":[0,0]},"width":[0,0],"height":[0,0]}},"typespec":{"name":"Waiter","level":1,"model":1,"code":101,"specs":{"shield":{"capacity":[100,100],"reload":[100,100]},"generator":{"capacity":[1,1],"reload":[1,1]},"ship":{"mass":0,"speed":[1,1],"rotation":[1,1],"acceleration":[1,1]}},"shape":[0,0,0,0,0,0,0,0,0,0,0,0,0,0.002,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"lasers":[],"radius":0.002,"next":[]}}'
};
const shipList = {
  advancedFighter: "{\"name\":\"Advanced-Fighter\",\"level\":6,\"model\":1,\"size\":2,\"specs\":{\"shield\":{\"capacity\":[200,350],\"reload\":[4,6]},\"generator\":{\"capacity\":[120,200],\"reload\":[50,60]},\"ship\":{\"mass\":400,\"speed\":[70,80],\"rotation\":[30,50],\"acceleration\":[70,100]}},\"bodies\":{\"main\":{\"section_segments\":12,\"offset\":{\"x\":0,\"y\":0,\"z\":10},\"position\":{\"x\":[0,0,0,0,0,0,0,0],\"y\":[-100,-80,-90,-50,0,50,100,90],\"z\":[0,0,0,0,0,0,0,0]},\"width\":[0,5,15,25,40,25,20,0],\"height\":[0,5,10,30,25,20,10,0],\"propeller\":true,\"texture\":[4,4,1,1,10,1,1],\"laser\":{\"damage\":[90,150],\"rate\":1,\"type\":2,\"speed\":[180,240],\"number\":1,\"recoil\":150,\"error\":0}},\"cockpit\":{\"section_segments\":12,\"offset\":{\"x\":0,\"y\":-35,\"z\":33},\"position\":{\"x\":[0,0,0,0,0,0,0],\"y\":[-30,-20,10,30,40],\"z\":[0,0,0,0,0,0,0]},\"width\":[0,12,15,10,0],\"height\":[0,12,18,12,0],\"propeller\":false,\"texture\":[7,9,9,7]},\"side_propellers\":{\"section_segments\":10,\"offset\":{\"x\":30,\"y\":30,\"z\":0},\"position\":{\"x\":[0,0,0,0,0,0],\"y\":[-50,-20,0,20,80,70],\"z\":[0,0,0,0,0,0]},\"width\":[15,20,10,25,10,0],\"height\":[10,15,15,10,5,0],\"angle\":0,\"propeller\":true,\"texture\":[3,63,4,10,3]},\"cannons\":{\"section_segments\":12,\"offset\":{\"x\":70,\"y\":50,\"z\":-30},\"position\":{\"x\":[0,0,0,0,0,0,0],\"y\":[-50,-45,-20,0,20,50,55],\"z\":[0,0,0,0,0,0,0]},\"width\":[0,5,10,10,15,10,0],\"height\":[0,5,15,15,10,5,0],\"angle\":0,\"propeller\":false,\"texture\":[4,4,10,4,63,4],\"laser\":{\"damage\":[6,12],\"rate\":3,\"type\":1,\"speed\":[100,150],\"number\":1,\"error\":0}},\"cannons2\":{\"section_segments\":12,\"offset\":{\"x\":95,\"y\":50,\"z\":-40},\"position\":{\"x\":[0,0,0,0],\"y\":[-50,-20,40,50],\"z\":[0,0,0,0]},\"width\":[2,5,5,2],\"height\":[2,15,15,2],\"angle\":0,\"propeller\":false,\"texture\":6,\"laser\":{\"damage\":[4,10],\"rate\":3,\"type\":1,\"speed\":[100,150],\"number\":1,\"error\":0}}},\"wings\":{\"main\":{\"length\":[100,30,20],\"width\":[100,50,40,30],\"angle\":[-25,20,25],\"position\":[30,70,50,50],\"bump\":{\"position\":-20,\"size\":20},\"offset\":{\"x\":0,\"y\":0,\"z\":0},\"texture\":[11,11,63],\"doubleside\":true},\"winglets\":{\"length\":[40],\"width\":[40,20,30],\"angle\":[10,-10],\"position\":[-50,-70,-65],\"bump\":{\"position\":0,\"size\":30},\"texture\":63,\"offset\":{\"x\":0,\"y\":0,\"z\":0}}},\"typespec\":{\"name\":\"Advanced-Fighter\",\"level\":6,\"model\":1,\"code\":601,\"specs\":{\"shield\":{\"capacity\":[200,350],\"reload\":[4,6]},\"generator\":{\"capacity\":[120,200],\"reload\":[50,60]},\"ship\":{\"mass\":400,\"speed\":[70,80],\"rotation\":[30,50],\"acceleration\":[70,100]}},\"shape\":[4,3.65,3.454,3.504,3.567,2.938,1.831,1.707,1.659,1.943,1.92,1.882,1.896,3.96,5.654,5.891,6.064,5.681,5.436,5.573,5.122,4.855,4.675,4.626,4.479,4.008,4.479,4.626,4.675,4.855,5.122,5.573,5.436,5.681,6.064,5.891,5.654,3.96,3.88,1.882,1.92,1.943,1.659,1.707,1.831,2.938,3.567,3.504,3.454,3.65],\"lasers\":[{\"x\":0,\"y\":-4,\"z\":0.4,\"angle\":0,\"damage\":[90,150],\"rate\":1,\"type\":2,\"speed\":[180,240],\"number\":1,\"spread\":0,\"error\":0,\"recoil\":150},{\"x\":2.8,\"y\":0,\"z\":-1.2,\"angle\":0,\"damage\":[6,12],\"rate\":3,\"type\":1,\"speed\":[100,150],\"number\":1,\"spread\":0,\"error\":0,\"recoil\":0},{\"x\":-2.8,\"y\":0,\"z\":-1.2,\"angle\":0,\"damage\":[6,12],\"rate\":3,\"type\":1,\"speed\":[100,150],\"number\":1,\"spread\":0,\"error\":0,\"recoil\":0},{\"x\":3.8,\"y\":0,\"z\":-1.6,\"angle\":0,\"damage\":[4,10],\"rate\":3,\"type\":1,\"speed\":[100,150],\"number\":1,\"spread\":0,\"error\":0,\"recoil\":0},{\"x\":-3.8,\"y\":0,\"z\":-1.6,\"angle\":0,\"damage\":[4,10],\"rate\":3,\"type\":1,\"speed\":[100,150],\"number\":1,\"spread\":0,\"error\":0,\"recoil\":0}],\"radius\":6.064}}",
	scorpion: "{\"name\":\"Scorpion\",\"level\":6,\"model\":1,\"size\":2,\"specs\":{\"shield\":{\"capacity\":[225,400],\"reload\":[5,7]},\"generator\":{\"capacity\":[80,175],\"reload\":[38,50]},\"ship\":{\"mass\":450,\"speed\":[75,90],\"rotation\":[50,70],\"acceleration\":[80,100]}},\"bodies\":{\"main\":{\"section_segments\":8,\"offset\":{\"x\":0,\"y\":0,\"z\":10},\"position\":{\"x\":[0,0,0,0,0,0,0,0],\"y\":[-90,-40,-30,0,50,100,120,110],\"z\":[-10,-5,0,0,0,0,20,20]},\"width\":[0,12,20,15,25,10,5],\"height\":[0,10,15,25,15,10,5],\"texture\":[1,4,63,11,11,4],\"propeller\":false},\"tail\":{\"section_segments\":14,\"offset\":{\"x\":0,\"y\":70,\"z\":50},\"position\":{\"x\":[0,0,0,0,0,0],\"y\":[-70,-25,-10,20,40,50],\"z\":[0,0,0,0,-10,-20]},\"width\":[0,5,35,25,5,5],\"height\":[0,5,25,20,5,5],\"texture\":[6,4,63,10,4],\"laser\":{\"damage\":[50,100],\"rate\":0.9,\"type\":2,\"speed\":[170,230],\"number\":1,\"angle\":0,\"error\":0,\"recoil\":100}},\"cockpit\":{\"section_segments\":8,\"offset\":{\"x\":13,\"y\":-44,\"z\":12},\"position\":{\"x\":[-5,0,0,0,0],\"y\":[-15,-5,0,5,15],\"z\":[0,0,0,1,0]},\"width\":[0,8,10,8,0],\"height\":[0,5,5,5,0],\"texture\":[6,5],\"propeller\":false},\"deco\":{\"section_segments\":8,\"offset\":{\"x\":70,\"y\":0,\"z\":-10},\"position\":{\"x\":[0,0,0,10,-5,0,0,0],\"y\":[-115,-80,-100,-60,-30,-10,20,0],\"z\":[0,0,0,0,0,0,0,0]},\"width\":[1,5,10,15,15,20,10,0],\"height\":[1,5,15,20,35,30,10,0],\"texture\":[6,6,1,1,11,2,12],\"laser\":{\"damage\":[2,3],\"rate\":1.8,\"type\":1,\"speed\":[130,170],\"number\":2,\"angle\":5,\"error\":0},\"propeller\":true},\"wingends\":{\"section_segments\":8,\"offset\":{\"x\":105,\"y\":-80,\"z\":-10},\"position\":{\"x\":[0,2,4,2,0],\"y\":[-20,-10,0,10,20],\"z\":[0,0,0,0,0]},\"width\":[2,3,6,3,2],\"height\":[5,15,22,17,5],\"texture\":4,\"angle\":0,\"propeller\":false}},\"wings\":{\"main\":{\"length\":[80,30],\"width\":[40,30,20],\"angle\":[-10,20],\"position\":[30,-50,-80],\"texture\":63,\"bump\":{\"position\":30,\"size\":10},\"offset\":{\"x\":0,\"y\":0,\"z\":0}},\"font\":{\"length\":[80,30],\"width\":[20,15],\"angle\":[-10,20],\"position\":[-20,-40],\"texture\":4,\"bump\":{\"position\":30,\"size\":10},\"offset\":{\"x\":0,\"y\":0,\"z\":0}}},\"typespec\":{\"name\":\"Scorpion\",\"level\":6,\"model\":2,\"code\":602,\"specs\":{\"shield\":{\"capacity\":[225,400],\"reload\":[5,7]},\"generator\":{\"capacity\":[80,175],\"reload\":[38,50]},\"ship\":{\"mass\":450,\"speed\":[75,90],\"rotation\":[50,70],\"acceleration\":[80,100]}},\"shape\":[3.6,2.846,2.313,2.192,5.406,5.318,5.843,5.858,5.621,4.134,3.477,3.601,3.622,3.464,3.351,3.217,1.458,1.391,1.368,1.37,1.635,2.973,3.47,3.911,4.481,4.804,4.481,3.911,3.47,2.973,1.635,1.37,1.368,1.391,1.458,3.217,3.351,3.464,3.622,3.601,3.477,4.134,5.621,5.858,5.843,5.318,5.406,2.192,2.313,2.846],\"lasers\":[{\"x\":0,\"y\":0,\"z\":2,\"angle\":0,\"damage\":[50,100],\"rate\":0.9,\"type\":2,\"speed\":[170,230],\"number\":1,\"spread\":0,\"error\":0,\"recoil\":100},{\"x\":2.8,\"y\":-4.6,\"z\":-0.4,\"angle\":0,\"damage\":[2,3],\"rate\":1.8,\"type\":1,\"speed\":[130,170],\"number\":2,\"spread\":5,\"error\":0,\"recoil\":0},{\"x\":-2.8,\"y\":-4.6,\"z\":-0.4,\"angle\":0,\"damage\":[2,3],\"rate\":1.8,\"type\":1,\"speed\":[130,170],\"number\":2,\"spread\":5,\"error\":0,\"recoil\":0}],\"radius\":5.858}}",
	marauder: "{\"name\":\"Marauder\",\"level\":6,\"model\":1,\"size\":1.4,\"specs\":{\"shield\":{\"capacity\":[210,350],\"reload\":[8,11]},\"generator\":{\"capacity\":[85,160],\"reload\":[25,40]},\"ship\":{\"mass\":250,\"speed\":[70,110],\"rotation\":[60,80],\"acceleration\":[80,120]}},\"bodies\":{\"main\":{\"section_segments\":8,\"offset\":{\"x\":0,\"y\":-20,\"z\":10},\"position\":{\"x\":[0,0,0,0,0,0,0,0,0,0,0],\"y\":[-65,-75,-55,-40,0,30,60,80,90,80],\"z\":[0,0,0,0,0,0,0,0,0,0,0]},\"width\":[0,6,18,23,30,25,25,30,35,0],\"height\":[0,5,10,12,12,20,15,15,15,0],\"texture\":[6,4,1,10,1,1,11,12,17],\"propeller\":true,\"laser\":{\"damage\":[10,16],\"rate\":10,\"type\":1,\"speed\":[170,200],\"recoil\":0,\"number\":1,\"error\":0}},\"cockpit\":{\"section_segments\":[40,90,180,270,320],\"offset\":{\"x\":0,\"y\":-85,\"z\":22},\"position\":{\"x\":[0,0,0,0,0,0],\"y\":[15,35,60,95,125],\"z\":[-1,-2,-1,-1,3]},\"width\":[5,12,14,15,5],\"height\":[0,12,15,15,0],\"texture\":[8.98,8.98,4]},\"outriggers\":{\"section_segments\":10,\"offset\":{\"x\":25,\"y\":0,\"z\":-10},\"position\":{\"x\":[-5,-5,8,-5,0,0,0,0,0,0],\"y\":[-100,-125,-45,0,30,40,70,80,100,90],\"z\":[10,10,5,5,0,0,0,0,0,0,0,0]},\"width\":[0,6,10,10,15,15,15,15,10,0],\"height\":[0,10,20,25,25,25,25,25,20,0],\"texture\":[13,4,4,63,4,18,4,13,17],\"laser\":{\"damage\":[4,8],\"rate\":3,\"type\":1,\"speed\":[110,140],\"recoil\":0,\"number\":1,\"error\":0},\"propeller\":true},\"intake\":{\"section_segments\":12,\"offset\":{\"x\":25,\"y\":-5,\"z\":10},\"position\":{\"x\":[0,0,5,0,-3,0,0,0,0,0],\"y\":[-10,-30,-5,35,60,70,85,100,85],\"z\":[0,-6,0,0,0,0,0,0,0,0]},\"width\":[0,5,10,10,15,10,10,5,0],\"height\":[0,15,15,20,20,15,15,5,0],\"texture\":[6,4,63,4,63,18,4,17]}},\"wings\":{\"main\":{\"length\":[20,70,35],\"width\":[50,55,40,20],\"angle\":[0,-20,0],\"position\":[20,20,70,25],\"texture\":[3,18,63],\"doubleside\":true,\"bump\":{\"position\":30,\"size\":15},\"offset\":{\"x\":0,\"y\":0,\"z\":13}},\"spoiler\":{\"length\":[20,45,0,5],\"width\":[40,40,20,30,0],\"angle\":[0,20,90,90],\"position\":[60,60,80,80,90],\"texture\":[10,11,63],\"doubleside\":true,\"bump\":{\"position\":30,\"size\":18},\"offset\":{\"x\":0,\"y\":0,\"z\":30}},\"font\":{\"length\":[37],\"width\":[40,15],\"angle\":[-10],\"position\":[0,-45],\"texture\":[63],\"doubleside\":true,\"bump\":{\"position\":30,\"size\":10},\"offset\":{\"x\":35,\"y\":-20,\"z\":10}},\"shields\":{\"doubleside\":true,\"offset\":{\"x\":12,\"y\":60,\"z\":-15},\"length\":[0,15,45,20],\"width\":[30,30,65,65,30,30],\"angle\":[30,30,90,150],\"position\":[10,10,0,0,10],\"texture\":[4],\"bump\":{\"position\":0,\"size\":4}}},\"typespec\":{\"name\":\"Marauder\",\"level\":6,\"model\":3,\"code\":603,\"specs\":{\"shield\":{\"capacity\":[210,350],\"reload\":[8,11]},\"generator\":{\"capacity\":[85,160],\"reload\":[25,40]},\"ship\":{\"mass\":250,\"speed\":[70,110],\"rotation\":[60,80],\"acceleration\":[80,120]}},\"shape\":[2.665,3.563,3.573,2.856,2.359,2.03,2.85,2.741,2.228,1.71,1.404,1.199,1.11,3.408,3.491,3.521,3.44,3.385,3.439,3.481,3.181,2.932,2.962,2.944,2.85,2.244,2.85,2.944,2.962,2.932,3.181,3.481,3.439,3.385,3.44,3.521,3.491,3.408,1.11,1.199,1.404,1.71,2.228,2.741,2.85,2.03,2.359,2.856,3.573,3.563],\"lasers\":[{\"x\":0,\"y\":-2.66,\"z\":0.28,\"angle\":0,\"damage\":[10,16],\"rate\":10,\"type\":1,\"speed\":[170,200],\"number\":1,\"spread\":0,\"error\":0,\"recoil\":0},{\"x\":0.56,\"y\":-3.5,\"z\":-0.28,\"angle\":0,\"damage\":[4,8],\"rate\":3,\"type\":1,\"speed\":[110,140],\"number\":1,\"spread\":0,\"error\":0,\"recoil\":0},{\"x\":-0.56,\"y\":-3.5,\"z\":-0.28,\"angle\":0,\"damage\":[4,8],\"rate\":3,\"type\":1,\"speed\":[110,140],\"number\":1,\"spread\":0,\"error\":0,\"recoil\":0}],\"radius\":3.573}}",
	condor: "{\"name\":\"Condor\",\"level\":6,\"model\":1,\"size\":1.5,\"specs\":{\"shield\":{\"capacity\":[225,400],\"reload\":[7,10]},\"generator\":{\"capacity\":[70,130],\"reload\":[30,48]},\"ship\":{\"mass\":200,\"speed\":[75,105],\"rotation\":[50,70],\"acceleration\":[80,120]}},\"bodies\":{\"main\":{\"section_segments\":12,\"offset\":{\"x\":0,\"y\":0,\"z\":0},\"position\":{\"x\":[0,0,0,0,0,0,0,0,0,0,0,0,0,0],\"y\":[-110,-95,-100,-100,-45,-40,-25,-23,15,20,55,80,100,90],\"z\":[-10,-9,-8,-7,-6,-4,-2,0,0,0,0,0,0,0]},\"width\":[0,2,5,10,25,27,27,25,25,27,40,35,30,0],\"height\":[0,2,5,10,25,27,27,25,25,27,20,15,10,0],\"texture\":[6,2,3,10,5,63,5,2,5,3,63,11,4],\"propeller\":true,\"laser\":{\"damage\":[30,60],\"rate\":2,\"type\":2,\"speed\":[150,200],\"number\":1,\"angle\":0,\"error\":0}},\"cannons\":{\"section_segments\":12,\"offset\":{\"x\":75,\"y\":30,\"z\":-25},\"position\":{\"x\":[0,0,0,0,0,0,0],\"y\":[-50,-45,-20,0,20,50,55],\"z\":[0,0,0,0,0,0,0]},\"width\":[0,5,10,10,10,10,0],\"height\":[0,5,15,15,10,5,0],\"angle\":0,\"laser\":{\"damage\":[3,6],\"rate\":4,\"type\":1,\"speed\":[100,130],\"number\":1,\"angle\":0,\"error\":0},\"propeller\":false,\"texture\":[6,4,10,4,63,4]},\"cockpit\":{\"section_segments\":12,\"offset\":{\"x\":0,\"y\":-60,\"z\":8},\"position\":{\"x\":[0,0,0,0],\"y\":[-25,-8,20,65],\"z\":[0,0,0,0]},\"width\":[0,10,10,0],\"height\":[0,12,15,5],\"texture\":[9]}},\"wings\":{\"back\":{\"offset\":{\"x\":0,\"y\":25,\"z\":10},\"length\":[90,40],\"width\":[70,50,30],\"angle\":[-30,40],\"position\":[0,20,0],\"texture\":[11,63],\"doubleside\":true,\"bump\":{\"position\":10,\"size\":20}},\"front\":{\"offset\":{\"x\":0,\"y\":55,\"z\":10},\"length\":[90,40],\"width\":[70,50,30],\"angle\":[-30,-40],\"position\":[-60,-20,-20],\"texture\":[11,63],\"doubleside\":true,\"bump\":{\"position\":10,\"size\":10}}},\"typespec\":{\"name\":\"Condor\",\"level\":6,\"model\":4,\"code\":604,\"specs\":{\"shield\":{\"capacity\":[225,400],\"reload\":[7,10]},\"generator\":{\"capacity\":[70,130],\"reload\":[30,48]},\"ship\":{\"mass\":200,\"speed\":[75,105],\"rotation\":[50,70],\"acceleration\":[80,120]}},\"shape\":[3.3,3.015,2.45,1.959,1.658,1.477,1.268,1.11,1.148,1.237,2.34,2.448,2.489,3.283,3.363,3.501,3.586,3.333,3.496,3.502,3.154,2.52,3.016,3.132,3.054,3.006,3.054,3.132,3.016,2.52,3.154,3.502,3.496,3.333,3.586,3.501,3.363,3.283,2.49,2.448,2.34,1.237,1.148,1.11,1.268,1.477,1.658,1.959,2.45,3.015],\"lasers\":[{\"x\":0,\"y\":-3.3,\"z\":0,\"angle\":0,\"damage\":[30,60],\"rate\":2,\"type\":2,\"speed\":[150,200],\"number\":1,\"spread\":0,\"error\":0,\"recoil\":0},{\"x\":2.25,\"y\":-0.6,\"z\":-0.75,\"angle\":0,\"damage\":[3,6],\"rate\":4,\"type\":1,\"speed\":[100,130],\"number\":1,\"spread\":0,\"error\":0,\"recoil\":0},{\"x\":-2.25,\"y\":-0.6,\"z\":-0.75,\"angle\":0,\"damage\":[3,6],\"rate\":4,\"type\":1,\"speed\":[100,130],\"number\":1,\"spread\":0,\"error\":0,\"recoil\":0}],\"radius\":3.586}}",
	aSpeedster: "{\"name\":\"A-Speedster\",\"level\":6,\"model\":1,\"size\":1.5,\"specs\":{\"shield\":{\"capacity\":[200,300],\"reload\":[6,8]},\"generator\":{\"capacity\":[80,140],\"reload\":[30,45]},\"ship\":{\"mass\":175,\"speed\":[90,115],\"rotation\":[60,80],\"acceleration\":[90,140]}},\"bodies\":{\"main\":{\"section_segments\":8,\"offset\":{\"x\":0,\"y\":0,\"z\":0},\"position\":{\"x\":[0,0,0,0,0,0],\"y\":[-100,-95,0,0,70,65],\"z\":[0,0,0,0,0,0]},\"width\":[0,10,40,20,20,0],\"height\":[0,5,30,30,15,0],\"texture\":[6,11,5,63,12],\"propeller\":true,\"laser\":{\"damage\":[38,84],\"rate\":1,\"type\":2,\"speed\":[175,230],\"recoil\":50,\"number\":1,\"error\":0}},\"cockpit\":{\"section_segments\":8,\"offset\":{\"x\":0,\"y\":-60,\"z\":15},\"position\":{\"x\":[0,0,0,0,0,0,0],\"y\":[-20,0,20,40,50],\"z\":[-7,-5,0,0,0]},\"width\":[0,10,10,10,0],\"height\":[0,10,15,12,0],\"texture\":[9]},\"side_propulsors\":{\"section_segments\":10,\"offset\":{\"x\":50,\"y\":25,\"z\":0},\"position\":{\"x\":[0,0,0,0,0,0,0,0,0,0],\"y\":[-20,-15,0,10,20,25,30,40,80,70],\"z\":[0,0,0,0,0,0,0,0,0,0]},\"width\":[0,15,20,20,20,15,15,20,10,0],\"height\":[0,15,20,20,20,15,15,20,10,0],\"propeller\":true,\"texture\":[4,4,2,2,5,63,5,4,12]},\"cannons\":{\"section_segments\":12,\"offset\":{\"x\":30,\"y\":40,\"z\":45},\"position\":{\"x\":[0,0,0,0,0,0,0],\"y\":[-50,-45,-20,0,20,30,40],\"z\":[0,0,0,0,0,0,0]},\"width\":[0,5,7,10,3,5,0],\"height\":[0,5,7,8,3,5,0],\"angle\":-10,\"laser\":{\"damage\":[8,12],\"rate\":2,\"type\":1,\"speed\":[100,130],\"number\":1,\"angle\":-10,\"error\":0},\"propeller\":false,\"texture\":[6,4,10,4,63,4]}},\"wings\":{\"join\":{\"offset\":{\"x\":0,\"y\":0,\"z\":10},\"length\":[40,0],\"width\":[10,20],\"angle\":[-1],\"position\":[0,30],\"texture\":[63],\"bump\":{\"position\":0,\"size\":25}},\"winglets\":{\"offset\":{\"x\":0,\"y\":-40,\"z\":10},\"doubleside\":true,\"length\":[45,10],\"width\":[5,20,30],\"angle\":[50,-10],\"position\":[90,80,50],\"texture\":[4],\"bump\":{\"position\":10,\"size\":30}}},\"typespec\":{\"name\":\"A-Speedster\",\"level\":6,\"model\":5,\"code\":605,\"specs\":{\"shield\":{\"capacity\":[200,300],\"reload\":[6,8]},\"generator\":{\"capacity\":[80,140],\"reload\":[30,45]},\"ship\":{\"mass\":175,\"speed\":[90,115],\"rotation\":[60,80],\"acceleration\":[90,140]}},\"shape\":[3,2.914,2.408,1.952,1.675,1.49,1.349,1.263,1.198,1.163,1.146,1.254,1.286,1.689,2.06,2.227,2.362,2.472,2.832,3.082,3.436,3.621,3.481,2.48,2.138,2.104,2.138,2.48,3.481,3.621,3.436,3.082,2.832,2.472,2.362,2.227,2.06,1.689,1.286,1.254,1.146,1.163,1.198,1.263,1.349,1.49,1.675,1.952,2.408,2.914],\"lasers\":[{\"x\":0,\"y\":-3,\"z\":0,\"angle\":0,\"damage\":[38,84],\"rate\":1,\"type\":2,\"speed\":[175,230],\"number\":1,\"spread\":0,\"error\":0,\"recoil\":50},{\"x\":1.16,\"y\":-0.277,\"z\":1.35,\"angle\":-10,\"damage\":[8,12],\"rate\":2,\"type\":1,\"speed\":[100,130],\"number\":1,\"spread\":-10,\"error\":0,\"recoil\":0},{\"x\":-1.16,\"y\":-0.277,\"z\":1.35,\"angle\":10,\"damage\":[8,12],\"rate\":2,\"type\":1,\"speed\":[100,130],\"number\":1,\"spread\":-10,\"error\":0,\"recoil\":0}],\"radius\":3.621}}",
	rockTower: "{\"name\":\"Rock-Tower\",\"level\":6,\"model\":1,\"size\":2.1,\"specs\":{\"shield\":{\"capacity\":[300,500],\"reload\":[8,11]},\"generator\":{\"capacity\":[75,115],\"reload\":[35,45]},\"ship\":{\"mass\":450,\"speed\":[75,90],\"rotation\":[50,70],\"acceleration\":[80,90]}},\"bodies\":{\"main\":{\"section_segments\":8,\"offset\":{\"x\":0,\"y\":0,\"z\":10},\"position\":{\"x\":[0,0,0,0,0,0,0,0,0,0],\"y\":[-90,-85,-70,-60,-20,-25,40,85,70],\"z\":[-10,-8,-5,0,0,0,0,0,0]},\"width\":[0,40,45,10,12,30,30,20,0],\"height\":[0,10,12,8,12,10,25,20,0],\"texture\":[4,63,4,4,4,11,10,12],\"propeller\":true},\"cockpit\":{\"section_segments\":12,\"offset\":{\"x\":0,\"y\":30,\"z\":20},\"position\":{\"x\":[0,0,0,0,0,0,0,0],\"y\":[-30,-20,0,10,20,30],\"z\":[0,0,0,0,0,0]},\"width\":[0,10,15,15,10,5],\"height\":[0,10,15,15,10,5],\"texture\":9,\"propeller\":false},\"dimeds_banhammer\":{\"section_segments\":6,\"offset\":{\"x\":25,\"y\":-70,\"z\":-10},\"position\":{\"x\":[0,0,0,0,0,0],\"y\":[-20,-10,-20,0,10,12],\"z\":[0,0,0,0,0,0]},\"width\":[0,0,5,7,6,0],\"height\":[0,0,5,7,6,0],\"texture\":[6,6,6,10,12],\"angle\":0,\"laser\":{\"damage\":[4,6],\"rate\":8,\"type\":1,\"speed\":[150,230],\"number\":1,\"error\":5}},\"propulsors\":{\"section_segments\":8,\"offset\":{\"x\":30,\"y\":50,\"z\":0},\"position\":{\"x\":[0,0,5,5,0,0,0],\"y\":[-45,-50,-20,0,20,50,40],\"z\":[0,0,0,0,0,0,0]},\"width\":[0,10,15,15,15,10,0],\"height\":[0,15,20,25,20,10,0],\"texture\":[11,2,3,4,5,12],\"angle\":0,\"propeller\":true}},\"wings\":{\"main\":{\"length\":[55,15],\"width\":[60,40,30],\"angle\":[-10,20],\"position\":[30,40,30],\"texture\":63,\"doubleside\":true,\"offset\":{\"x\":0,\"y\":20,\"z\":-5},\"bump\":{\"position\":30,\"size\":20}},\"finalizer_fins\":{\"length\":[20],\"width\":[20,10],\"angle\":[-70],\"position\":[-42,-30],\"texture\":63,\"doubleside\":true,\"offset\":{\"x\":35,\"y\":-35,\"z\":0},\"bump\":{\"position\":0,\"size\":30}}},\"typespec\":{\"name\":\"Rock-Tower\",\"level\":6,\"model\":6,\"code\":606,\"specs\":{\"shield\":{\"capacity\":[300,500],\"reload\":[8,11]},\"generator\":{\"capacity\":[75,115],\"reload\":[35,45]},\"ship\":{\"mass\":450,\"speed\":[75,90],\"rotation\":[50,70],\"acceleration\":[80,90]}},\"shape\":[3.78,3.758,3.974,3.976,3.946,3.508,1.532,1.64,1.556,1.426,1.347,1.298,1.269,1.764,1.894,2.075,3.269,3.539,3.933,3.989,4.058,4.127,4.524,4.416,3.634,3.577,3.634,4.416,4.524,4.127,4.058,3.989,3.933,3.539,3.269,2.075,1.894,1.764,1.68,1.298,1.347,1.426,1.556,1.64,1.532,3.508,3.946,3.976,3.974,3.758],\"lasers\":[{\"x\":1.05,\"y\":-3.78,\"z\":-0.42,\"angle\":0,\"damage\":[4,6],\"rate\":8,\"type\":1,\"speed\":[150,230],\"number\":1,\"spread\":0,\"error\":5,\"recoil\":0},{\"x\":-1.05,\"y\":-3.78,\"z\":-0.42,\"angle\":0,\"damage\":[4,6],\"rate\":8,\"type\":1,\"speed\":[150,230],\"number\":1,\"spread\":0,\"error\":5,\"recoil\":0}],\"radius\":4.524}}",
	barracuda: "{\"name\":\"Barracuda\",\"level\":6,\"model\":1,\"size\":2.4,\"specs\":{\"shield\":{\"capacity\":[300,400],\"reload\":[8,12]},\"generator\":{\"capacity\":[100,150],\"reload\":[8,14]},\"ship\":{\"mass\":675,\"speed\":[70,90],\"rotation\":[30,45],\"acceleration\":[130,150],\"dash\":{\"rate\":2,\"burst_speed\":[160,200],\"speed\":[120,150],\"acceleration\":[70,70],\"initial_energy\":[50,75],\"energy\":[20,30]}}},\"bodies\":{\"body\":{\"section_segments\":12,\"offset\":{\"x\":0,\"y\":0,\"z\":0},\"position\":{\"x\":[0,0,0,0,0,0,0,0,0,0],\"y\":[-90,-100,-60,-10,0,20,50,80,100,90],\"z\":[0,0,0,0,0,0,0,0,0,0,0]},\"width\":[0,5,20,25,35,40,40,35,30,0],\"height\":[0,5,40,45,40,60,70,60,30,0],\"texture\":[10,2,10,2,3,13,13,63,12],\"propeller\":true},\"front\":{\"section_segments\":8,\"offset\":{\"x\":0,\"y\":-20,\"z\":0},\"position\":{\"x\":[0,0,0,0,0],\"y\":[-90,-85,-70,-60,-20],\"z\":[0,0,0,0,0]},\"width\":[0,40,45,10,12],\"height\":[0,15,18,8,12],\"texture\":[8,63,4,4,4],\"propeller\":true},\"propeller\":{\"section_segments\":10,\"offset\":{\"x\":40,\"y\":40,\"z\":0},\"position\":{\"x\":[0,0,0,0,0,0,0,0,0,0],\"y\":[-20,-15,0,10,20,25,30,40,70,60],\"z\":[0,0,0,0,0,0,0,0,0,0]},\"width\":[0,10,15,15,15,10,10,20,15,0],\"height\":[0,10,15,15,15,10,10,18,8,0],\"texture\":[4,4,10,3,3,63,4,63,12],\"propeller\":true},\"sides\":{\"section_segments\":6,\"angle\":90,\"offset\":{\"x\":0,\"y\":0,\"z\":0},\"position\":{\"x\":[0,0,0,0,0,0,0,0,0,0],\"y\":[-80,-75,-60,-50,-10,10,50,60,75,80],\"z\":[0,0,0,0,0,0,0,0,0,0]},\"width\":[0,30,35,10,12,12,10,35,30,0],\"height\":[0,10,12,8,12,12,8,12,10,0],\"texture\":[4,63,4,4,4,4,4,63,4]},\"cockpit\":{\"section_segments\":12,\"offset\":{\"x\":0,\"y\":-20,\"z\":30},\"position\":{\"x\":[0,0,0,0,0,0,0,0],\"y\":[-50,-20,0,10,30,50],\"z\":[0,0,0,0,0,0]},\"width\":[0,12,18,20,15,0],\"height\":[0,20,22,24,20,0],\"texture\":[9]}},\"wings\":{\"top\":{\"doubleside\":true,\"offset\":{\"x\":0,\"y\":20,\"z\":15},\"length\":[70],\"width\":[70,30],\"angle\":[90],\"position\":[0,30],\"texture\":[63],\"bump\":{\"position\":10,\"size\":30}},\"top2\":{\"doubleside\":true,\"offset\":{\"x\":0,\"y\":51,\"z\":5},\"length\":[70],\"width\":[50,20],\"angle\":[90],\"position\":[0,60],\"texture\":[63],\"bump\":{\"position\":10,\"size\":30}}},\"typespec\":{\"name\":\"Barracuda\",\"level\":6,\"model\":7,\"code\":607,\"specs\":{\"shield\":{\"capacity\":[300,400],\"reload\":[8,12]},\"generator\":{\"capacity\":[100,150],\"reload\":[8,14]},\"ship\":{\"mass\":675,\"speed\":[70,90],\"rotation\":[30,45],\"acceleration\":[130,150],\"dash\":{\"rate\":2,\"burst_speed\":[160,200],\"speed\":[120,150],\"acceleration\":[70,70],\"initial_energy\":[50,75],\"energy\":[20,30]}}},\"shape\":[5.28,5.25,5.332,5.393,4.944,1.997,1.745,1.556,1.435,3.587,3.81,3.779,3.838,3.84,3.779,3.81,3.587,3.205,3.571,3.9,5.132,5.888,5.835,5.551,4.886,5.808,4.886,5.551,5.835,5.888,5.132,3.9,3.571,3.205,3.587,3.81,3.779,3.838,3.84,3.779,3.81,3.587,1.435,1.556,1.745,1.997,4.944,5.393,5.332,5.25],\"lasers\":[],\"radius\":5.888}}",
	oDefender: "{\"name\":\"O-Defender\",\"level\":6,\"model\":1,\"size\":2.2,\"specs\":{\"shield\":{\"capacity\":[400,550],\"reload\":[10,13]},\"generator\":{\"capacity\":[70,100],\"reload\":[25,40]},\"ship\":{\"mass\":500,\"speed\":[70,80],\"rotation\":[30,40],\"acceleration\":[60,80]}},\"bodies\":{\"main\":{\"section_segments\":8,\"offset\":{\"x\":0,\"y\":0,\"z\":0},\"position\":{\"x\":[0,0,0,0,0],\"y\":[-90,-88,0,90,91],\"z\":[0,0,0,0,0]},\"width\":[5,6,25,10,20],\"height\":[2,10,40,20,20],\"texture\":[63,1,10],\"propeller\":true,\"laser\":{\"damage\":[35,60],\"rate\":2,\"type\":2,\"speed\":[130,180],\"number\":1,\"angle\":0,\"error\":0}},\"side\":{\"section_segments\":10,\"offset\":{\"x\":50,\"y\":0,\"z\":0},\"position\":{\"x\":[-40,-5,15,25,20,0,-50],\"y\":[-100,-70,-40,-10,20,50,90],\"z\":[0,0,0,0,0,0,0]},\"width\":[5,20,20,20,20,20,5],\"height\":[15,25,30,30,30,25,0],\"texture\":[0,1,2,3,4,63]},\"cockpit\":{\"section_segments\":8,\"offset\":{\"x\":0,\"y\":-60,\"z\":18},\"position\":{\"x\":[0,0,0,0,0,0,0],\"y\":[-10,0,20,30,40],\"z\":[0,0,0,0,0]},\"width\":[0,5,10,10,0],\"height\":[0,5,10,12,0],\"texture\":[9]},\"top_propulsor\":{\"section_segments\":15,\"offset\":{\"x\":0,\"y\":0,\"z\":10},\"position\":{\"x\":[0,0,0,0],\"y\":[80,95,100,90],\"z\":[0,0,0,0]},\"width\":[5,20,10,0],\"height\":[5,15,5,0],\"propeller\":true,\"texture\":[1,63,12]},\"bottom_propulsor\":{\"section_segments\":15,\"offset\":{\"x\":0,\"y\":0,\"z\":-10},\"position\":{\"x\":[0,0,0,0],\"y\":[80,95,100,90],\"z\":[0,0,0,0]},\"width\":[5,20,10,0],\"height\":[5,15,5,0],\"propeller\":true,\"texture\":[1,63,12]}},\"wings\":{\"join\":{\"offset\":{\"x\":0,\"y\":20,\"z\":0},\"length\":[80,0],\"width\":[130,50],\"angle\":[-1],\"position\":[0,-30],\"texture\":[8],\"bump\":{\"position\":-20,\"size\":15}}},\"typespec\":{\"name\":\"O-Defender\",\"level\":6,\"model\":8,\"code\":608,\"specs\":{\"shield\":{\"capacity\":[400,550],\"reload\":[10,13]},\"generator\":{\"capacity\":[70,100],\"reload\":[25,40]},\"ship\":{\"mass\":500,\"speed\":[70,80],\"rotation\":[30,40],\"acceleration\":[60,80]}},\"shape\":[4.409,4.448,4.372,4.204,4.119,4.136,4.174,4.107,4.066,4.094,4.073,4.141,4.16,4.062,4.015,3.966,3.83,3.76,3.742,3.591,3.502,3.494,3.575,4.291,4.422,4.409,4.422,4.291,3.575,3.494,3.502,3.591,3.742,3.76,3.83,3.966,4.015,4.062,4.16,4.141,4.073,4.094,4.066,4.107,4.174,4.136,4.119,4.204,4.372,4.448],\"lasers\":[{\"x\":0,\"y\":-3.96,\"z\":0,\"angle\":0,\"damage\":[35,60],\"rate\":2,\"type\":2,\"speed\":[130,180],\"number\":1,\"spread\":0,\"error\":0,\"recoil\":0}],\"radius\":4.448}}"
};
const uis = {
  waitPlayers: {
    id: "waitPlayers",
    position: [40, 15, 20, 10],
    visible: true,
    components: [{
        type: "text",
        position: [0, 0, 100, 50],
        value: "Waiting for more players...️",
        color: "#cde"
      },
      {
        type: "text",
        position: [0, 50, 100, 50],
        color: "#cde"
      }
    ]
  },
  waitPlayersBoard: {
    id: "scoreboard",
    visible: true,
    components: [
      {
        type: "text",
        position: [5, 0, 90, 10],
        value: "Waiting for more players...",
        color: "#cde"
      }
    ]
  },
  chosenShip: {
    id: "chosenShip",
    position: [3, 30, 15, 10],
    visible: true,
    components: [
      {
        type: "box",
        position: [0, 0, 100, 100],
        stroke: "#cde",
        width: 2
      },
      {
        type: "text",
        position: [5, 0, 90, 50],
        value: "This match's ship:",
        color: "#cde"
      },
      {
        type: "text",
        position: [5, 50, 90, 50],
        color: "#abf"
      },
    ]
  }
};

const rand = function (n) { return ~~(Math.random() * n)};
const hideUI = function (id, ship) { ship.setUIComponent({ id: id, position: [0, 0, 0, 0], visible: false, clickable: false }) };

class Match {
  constructor() {
    this.map = maps[rand(maps.length)];
    this.customShipI = rand(Object.values(shipList).length);
    this.customShip = Object.values(shipList)[this.customShipI];
    
    this.currTeam = 0;
    this.started = false;
  }
  
  init () {
   for (let i = 0; i < this.map.bedSpawn.length; i++) {
      game.setObject({
        id: `bed-${i}`,
        position: { x: this.map.bedSpawn[i].x, y: this.map.bedSpawn[i].y, z: objects.bed.depth },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: objects.bed.scale, y: objects.bed.scale, z: objects.bed.scale },
        type: {
          id: `bed-${i}`,
          obj: objects.bed.obj,
          emissive: objects.bed.emissives[i]
        },
        physics: objects.bed.physics
      });
    }
    return this;
  }
}
let currMatch = new Match().init();

const sendBack = function () {
	game.ships.forEach((ship) => {
		ship.set({
  		x: currMatch.map.shipSpawn[ship.custom.teamNum].x,
			y: currMatch.map.shipSpawn[ship.custom.teamNum].y,
		  
			shield: 1000,
			crystals: 0,
			stats: 99999999
		});
	});
};

const waitPlayers = function () {
	if (game.ships.length < playersReq) {
	  uis.waitPlayers.components[1].value = `${playersReq - game.ships.length} player(s) remaining`;
	  game.setUIComponent(uis.waitPlayers);
	  game.setUIComponent(uis.waitPlayersBoard);
		game.ships.forEach((ship) => {
			ship.set({
				type: 101,
				idle: true,
				collider: false
			});
		});
	}
	else {
	  hideUI("waitPlayers", game);
	  hideUI("waitPlayersBoard", game);
	  game.ships.forEach((ship) => {
			ship.set({
				type: shipType,
				idle: false,
				collider: true
			});
		});
		currMatch.started = true;
	}
};

const setUIs = function () {
  game.ships.forEach((ship) => {
    uis.chosenShip.components[2].value = JSON.parse(currMatch.customShip).name;
    ship.setUIComponent(uis.chosenShip);
  });
};

this.options = {
	root_mode: "",
	
	map_size: 60,
	custom_map: currMatch.map.map,
	asteroids_strength: 1000000,
	
	reset_tree: true,
	ships: Object.values(funcShips).concat(currMatch.customShip),
	
	radar_zoom: 1,
	max_players: 20
};

this.tick = function () {
  if (game.step % gameSkip == 0) {
	  if (currMatch.started) {
	    setUIs();
	  }
	  else {
	    waitPlayers();
	    sendBack();
	  }
  }
};

this.event = function (event) {
	let ship = event.ship;
	switch (event.name) {
		case "ship_spawned":
			ship.custom = {
				teamNum: currMatch.currTeam
			};
			currMatch.currTeam = currMatch.currTeam < 3 ? currMatch.currTeam + 1 : 0;
			
			ship.set({
			  x: currMatch.map.shipSpawn[ship.custom.teamNum].x,
  			y: currMatch.map.shipSpawn[ship.custom.teamNum].y,
  			
  		  type: shipType,
  		  
  			shield: 1000,
  			crystals: 0,
  			stats: 99999999,
			});
			break;
		case "ui_component_clicked":
			break;
	}
};
