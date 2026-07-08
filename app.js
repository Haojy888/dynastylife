const DATA = window.DYNASTY_LIFE_DATA || {};
const SAVE_PREFIX = "dynasty-life-slot-";
const SAVE_META_KEY = "dynasty-life-save-meta";
const SAVE_LEGACY_KEY = "dynasty-life-web-modern-v1";
const MAX_SLOTS = 3;
let currentSlot = -1;

const app = document.getElementById("app");
const COPPER_PER_SILVER = 1000;
const SILVER_PER_GOLD = 10;
const COPPER_PER_GOLD = COPPER_PER_SILVER * SILVER_PER_GOLD;

const STAT_DEFS = [
  ["mood", "心情", "Mood", ["低落", "平稳", "舒畅", "极好"]],
  ["physique", "体魄", "Physique", ["虚弱", "尚可", "强健", "龙精虎猛"]],
  ["looks", "魅力", "Looks", ["平平", "清秀", "俊美", "美貌无双"]],
  ["eq", "处世", "Eq", ["木讷", "通达", "圆融", "八面玲珑"]],
  ["knowledge", "学识", "Knowledge", ["蒙昧", "识字", "博闻", "学富五车"]],
  ["virtue", "德行", "Virtue", ["鸿蒙未开", "守礼", "仁善", "德高望重"]],
];

const STAT_LABELS = Object.fromEntries(STAT_DEFS.map(([key, label]) => [key, label]));
const STAT_ICONS = Object.fromEntries(STAT_DEFS.map(([key, , icon]) => [key, icon]));
const STAT_DESC = Object.fromEntries(STAT_DEFS.map(([key, , , desc]) => [key, desc]));
Object.assign(STAT_LABELS, { money: "钱财", relationship: "人际", favorability: "名望" });

const MEMBER_MAP = {
  Physique: "physique",
  Knowledge: "knowledge",
  Looks: "looks",
  Eq: "eq",
  Virtue: "virtue",
  Mood: "mood",
  Relationship: "relationship",
  Money: "money",
  Favorability: "favorability",
};

const PREMIUM_ICON_OVERRIDES = {
  MainBook: "assets/premium-icons/guide-book.webp",
  Book: "assets/premium-icons/academy-book.webp",
  Book1: "assets/premium-icons/academy-book.webp",
  Book2: "assets/premium-icons/academy-book.webp",
  Book6: "assets/premium-icons/academy-book.webp",
  OfficialSchool: "assets/premium-icons/academy-book.webp",
  BookStore: "assets/premium-icons/bookshop-scrolls.webp",
  Agriculture: "assets/premium-icons/agriculture-field.webp",
  PaddyField: "assets/premium-icons/paddy-field.webp",
  Elixir: "assets/premium-icons/alchemy-furnace.webp",
  Craftsman: "assets/premium-icons/artisan-tools.webp",
  MedicineBag: "assets/premium-icons/medicine-bag.webp",
  Hospital: "assets/premium-icons/clinic-hall.webp",
  Temple: "assets/premium-icons/temple-incense.webp",
  Wine1: "assets/premium-icons/wine-flagon.webp",
  DrinkingWine: "assets/premium-icons/banquet-wine.webp",
  Whorehouse: "assets/premium-icons/courtesan-pavilion.webp",
  FemaleSkill: "assets/premium-icons/women-school.webp",
  ArrangeMarriage: "assets/premium-icons/matchmaker-thread.webp",
  Cricket: "assets/premium-icons/cricket-cage.webp",
  CatchCricket: "assets/premium-icons/cricket-cage.webp",
  RepairCarriage: "assets/premium-icons/carriage.webp",
  Backpack: "assets/premium-icons/satchel.webp",
  CashBox: "assets/premium-icons/ledger-chest.webp",
  FamilyIcon: "assets/premium-icons/family-courtyard.webp",
  House: "assets/premium-icons/estate-gate.webp",
  Backyard: "assets/premium-icons/backyard-courtyard.webp",
  BambooHouse: "assets/premium-icons/bamboo-cottage.webp",
  ClayTileHouse: "assets/premium-icons/clay-tile-house.webp",
  Courtyard: "assets/premium-icons/courtyard-estate.webp",
  CourtyardDwellings: "assets/premium-icons/dwellings-compound.webp",
  EarthBuilding: "assets/premium-icons/earth-building.webp",
  RoundDragonHouse: "assets/premium-icons/noble-mansion.webp",
  MedicineKingValley: "assets/premium-icons/herb-garden.webp",
  BuyShop: "assets/premium-icons/street-shop.webp",
  GroceryStore: "assets/premium-icons/grocery-store.webp",
  CarShop: "assets/premium-icons/carriage-shop.webp",
  Pawnshop: "assets/premium-icons/pawnshop-scales.webp",
  BlackMarket: "assets/premium-icons/black-market-lantern.webp",
  Jade: "assets/premium-icons/jade-pendant.webp",
  JadeCraftsman: "assets/premium-icons/jade-workshop.webp",
  Letter: "assets/premium-icons/sealed-letter.webp",
  SendLetter: "assets/premium-icons/sealed-letter.webp",
  FlowerChiefTitle: "assets/premium-icons/flower-chief.webp",
  BambooHorse: "assets/premium-icons/bamboo-horse.webp",
  DisputesAmongCivilians: "assets/premium-icons/civil-dispute.webp",
  Relationship1: "assets/premium-icons/relation-token.webp",
  Activity: "assets/premium-icons/activity-scroll.webp",
  Official: "assets/premium-icons/official-seal.webp",
  Restaurant: "assets/premium-icons/tea-inn.webp",
  Inn: "assets/premium-icons/tea-inn.webp",
  GamblingHouse: "assets/premium-icons/dice-house.webp",
  BambooFlute: "assets/premium-icons/elegant-games.webp",
  Game: "assets/premium-icons/elegant-games.webp",
};

const START_EVENT = {
  title: "抓周",
  content: "满岁之日，家中摆下几件物什。你伸出小手，长辈们屏息看你会抓起什么。",
  children: [
    {
      title: "抓书卷",
      content: "你抱住书卷不放，众人笑称你日后当有读书缘。",
      results: [
        { method: "InfluencePropertyOfInt", para: [{ kind: "DataVar", member: "Knowledge" }, [8]] },
        { method: "InfluencePropertyOfInt", para: [{ kind: "DataVar", member: "Mood" }, [2]] },
      ],
      children: [],
    },
    {
      title: "抓铜钱",
      content: "你攥住铜钱，满堂皆笑，说你天生会过日子。",
      results: [
        { method: "InfluencePropertyOfInt", para: [{ kind: "DataVar", member: "Money" }, [80]] },
        { method: "InfluencePropertyOfInt", para: [{ kind: "DataVar", member: "Eq" }, [3]] },
      ],
      children: [],
    },
    {
      title: "抓木剑",
      content: "你抱起木剑挥了两下，虽无章法，却颇有精神。",
      results: [
        { method: "InfluencePropertyOfInt", para: [{ kind: "DataVar", member: "Physique" }, [8]] },
        { method: "InfluencePropertyOfInt", para: [{ kind: "DataVar", member: "Virtue" }, [2]] },
      ],
      children: [],
    },
  ],
};

const ACTIVITIES = [
  {
    id: "agriculture",
    label: "农田",
    icon: "Agriculture",
    buckets: ["Agriculture"],
    effects: { virtue: [1, 4], money: [-20, 45], mood: [-1, 2] },
    text: "你去田亩间查问农桑，听取乡民与里正的说法。",
  },
  {
    id: "administration",
    label: "县务",
    icon: "Official",
    buckets: ["Administration"],
    effects: { eq: [1, 5], virtue: [-2, 4], money: [-25, 35] },
    text: "你入县署处理案牍，琐事纷至沓来。",
  },
  {
    id: "news",
    label: "消息",
    icon: "MainBook",
    buckets: ["News"],
    effects: { eq: [1, 4], relationship: [1, 4], mood: [-2, 3] },
    text: "你在城中打听近来风声，茶肆街巷皆有可闻之事。",
  },
  {
    id: "academy",
    label: "书院",
    icon: "Book",
    buckets: ["ImperialCollege"],
    effects: { knowledge: [3, 8], mood: [-2, 1] },
    text: "你在书院温课问学，案头灯火照到夜深。",
    exam: true,
  },
  {
    id: "temple",
    label: "寺庙",
    icon: "Temple",
    buckets: ["BuddhistEvent"],
    effects: { virtue: [2, 7], mood: [1, 4], money: [-12, -1] },
    text: "你入寺焚香，檐下钟声令人心静。",
  },
  {
    id: "restaurant",
    label: "酒楼",
    icon: "Restaurant",
    buckets: ["Restaurant", "News", "DrinkFlowerWine"],
    effects: { relationship: [2, 8], mood: [1, 5], money: [-35, -5] },
    text: "你进酒楼小坐，席间消息与人情最是热闹。",
  },
  {
    id: "flowerwine",
    label: "花酒",
    icon: "Wine1",
    buckets: ["DrinkFlowerWine"],
    effects: { mood: [2, 8], relationship: [1, 6], money: [-80, -20] },
    text: "你赴花酒之会，灯影杯声里最易生出故事。",
  },
  {
    id: "whorehouse",
    label: "风月",
    icon: "Whorehouse",
    buckets: ["SleepInWhorehouse"],
    effects: { mood: [2, 8], physique: [-4, 0], money: [-120, -30] },
    text: "你步入风月场，笙歌浮动，银钱也流水般散去。",
  },
  {
    id: "medicine",
    label: "医馆",
    icon: "Hospital",
    buckets: ["StudyInShangYaoJuEvent"],
    effects: { physique: [2, 8], knowledge: [1, 4], money: [-40, -8] },
    text: "你去医馆问诊，也顺手翻看几页医书。",
  },
  {
    id: "family",
    label: "探亲",
    icon: "FamilyIcon",
    buckets: ["ParentsThings", "FemaleSisterEvent"],
    effects: { relationship: [2, 7], mood: [1, 5] },
    text: "你归家探望亲眷，家常话里也有一年冷暖。",
  },
  {
    id: "sister",
    label: "闺友",
    icon: "FemaleSkill",
    buckets: ["FemaleSisterEvent"],
    effects: { relationship: [2, 7], eq: [1, 4], mood: [0, 5] },
    text: "你与闺中友人相会，闲言细语也能牵出人情。",
  },
  {
    id: "alchemy",
    label: "炼丹",
    icon: "Elixir",
    buckets: ["Alchemist"],
    effects: { physique: [-6, 8], mood: [-2, 5], money: [-50, -8] },
    text: "你寻方问药，炉火明灭，成败全看机缘。",
  },
  {
    id: "prison",
    label: "牢狱",
    icon: "PrisonHeader",
    buckets: ["PrisonAction"],
    effects: { mood: [-8, -2], eq: [1, 4], virtue: [-2, 4] },
    text: "你到牢狱中查问案情，铁锁声里有许多隐情。",
  },
];

const EXAM_STAGES = [
  { name: "童试", title: "秀才", pass: 3, count: 5, type: "choice" },
  { name: "乡试", title: "举人", pass: 4, count: 5, type: "choice" },
  { name: "会试", title: "贡士", pass: 4, count: 6, type: "choice" },
  { name: "殿试", title: "进士", pass: 66, type: "palace" },
];

const EXAM_TITLES = ["秀才", "举人", "贡士", "进士"];
const MAIN_EXAM_MIN_AGE = 15;
const REMOVED_EXAM_TYPES = ["english", "female-english"];
const SUPPLEMENTAL_IMPERIAL_QUESTIONS = [
  { content: "《论语》里“学而时习之”的下一句是？", answers: ["不亦说乎", "不亦乐乎", "不亦君子乎", "可以为师矣"], correct: "不亦说乎" },
  { content: "《论语》里“有朋自远方来”的下一句是？", answers: ["不亦乐乎", "不亦说乎", "人不知而不愠", "学而不思则罔"], correct: "不亦乐乎" },
  { content: "《论语》里“人不知而不愠”的下一句是？", answers: ["不亦君子乎", "可以为师矣", "见贤思齐焉", "小人喻于利"], correct: "不亦君子乎" },
  { content: "《论语》里“温故而知新”的下一句是？", answers: ["可以为师矣", "思而不学则殆", "必有我师焉", "不亦乐乎"], correct: "可以为师矣" },
  { content: "“三人行，必有我师焉”出自哪部典籍？", answers: ["《论语》", "《孟子》", "《大学》", "《诗经》"], correct: "《论语》" },
  { content: "“己所不欲”的下一句是？", answers: ["勿施于人", "必先利其器", "见贤思齐", "思而不学"], correct: "勿施于人" },
  { content: "《论语》里“君子喻于义”的下一句是？", answers: ["小人喻于利", "君子坦荡荡", "仁者不忧", "知者不惑"], correct: "小人喻于利" },
  { content: "《论语》里“见贤思齐焉”的下一句是？", answers: ["见不贤而内自省也", "三省吾身", "君子成人之美", "学而时习之"], correct: "见不贤而内自省也" },
  { content: "《论语》里“知之者不如好之者”的下一句是？", answers: ["好之者不如乐之者", "敏于事而慎于言", "温故而知新", "学而不厌"], correct: "好之者不如乐之者" },
  { content: "“学而不思则罔”的下一句是？", answers: ["思而不学则殆", "温故而知新", "博学而笃志", "敏而好学"], correct: "思而不学则殆" },
  { content: "“敏而好学，不耻下问”常用来称赞什么品格？", answers: ["勤学谦问", "勇猛善战", "精于算账", "善于辞令"], correct: "勤学谦问" },
  { content: "《大学》开篇“大学之道”的下一句是？", answers: ["在明明德", "在亲民", "在止于至善", "在格物致知"], correct: "在明明德" },
  { content: "《大学》传统“三纲领”不包括哪一项？", answers: ["格物", "明明德", "亲民", "止于至善"], correct: "格物" },
  { content: "《大学》八目次序里最先的一项是？", answers: ["格物", "诚意", "修身", "治国"], correct: "格物" },
  { content: "“修身、齐家、治国、平天下”出自四书中的哪一部？", answers: ["《大学》", "《中庸》", "《论语》", "《孟子》"], correct: "《大学》" },
  { content: "《中庸》开篇“天命之谓性”的下一句是？", answers: ["率性之谓道", "修道之谓教", "道也者不可须臾离也", "诚者天之道也"], correct: "率性之谓道" },
  { content: "《中庸》里“道也者”的后文常说它怎样？", answers: ["不可须臾离也", "可以为师矣", "在明明德", "万物皆备于我"], correct: "不可须臾离也" },
  { content: "“博学之，审问之，慎思之，明辨之，笃行之”出自哪部典籍？", answers: ["《中庸》", "《诗经》", "《尚书》", "《春秋》"], correct: "《中庸》" },
  { content: "《孟子》里“老吾老以及人之老”的下一句是？", answers: ["幼吾幼以及人之幼", "民为贵", "生于忧患", "得道者多助"], correct: "幼吾幼以及人之幼" },
  { content: "《孟子》里“民为贵”的下一句是？", answers: ["社稷次之", "君为轻", "仁者无敌", "养浩然之气"], correct: "社稷次之" },
  { content: "“得道者多助”的下一句是？", answers: ["失道者寡助", "天时不如地利", "人和为贵", "民为邦本"], correct: "失道者寡助" },
  { content: "“生于忧患”的下一句是？", answers: ["死于安乐", "舍生取义", "义不容辞", "知耻近乎勇"], correct: "死于安乐" },
  { content: "《孟子》“鱼，我所欲也；熊掌，亦我所欲也”之后常说应如何取舍？", answers: ["舍鱼而取熊掌", "舍义而取利", "舍仁而取勇", "舍礼而取名"], correct: "舍鱼而取熊掌" },
  { content: "“富贵不能淫，贫贱不能移，威武不能屈”强调的是哪种人格？", answers: ["大丈夫气节", "商贾机巧", "将帅权谋", "隐士清谈"], correct: "大丈夫气节" },
  { content: "四书不包括哪一部？", answers: ["《诗经》", "《大学》", "《中庸》", "《孟子》"], correct: "《诗经》" },
  { content: "五经不包括哪一部？", answers: ["《孟子》", "《诗经》", "《尚书》", "《礼记》"], correct: "《孟子》" },
  { content: "《诗经》第一篇通常是哪一篇？", answers: ["《关雎》", "《蒹葭》", "《采薇》", "《硕鼠》"], correct: "《关雎》" },
  { content: "《诗经》“关关雎鸠”的下一句是？", answers: ["在河之洲", "蒹葭苍苍", "桃之夭夭", "昔我往矣"], correct: "在河之洲" },
  { content: "《诗经》传统上分为哪三类？", answers: ["风、雅、颂", "赋、比、兴", "经、史、子", "诗、书、礼"], correct: "风、雅、颂" },
  { content: "《诗经》常说的表现手法“三体”是？", answers: ["赋、比、兴", "风、雅、颂", "仁、义、礼", "格、致、诚"], correct: "赋、比、兴" },
  { content: "《尚书》主要保存的是哪类古代文献？", answers: ["上古政书和诰命", "乐府民歌", "兵法图谱", "小说传奇"], correct: "上古政书和诰命" },
  { content: "《礼记》中哪两篇后来被列入“四书”？", answers: ["《大学》《中庸》", "《关雎》《蒹葭》", "《学而》《为政》", "《离骚》《九歌》"], correct: "《大学》《中庸》" },
  { content: "《周易》的基本符号体系是？", answers: ["卦爻", "韵脚", "官印", "律令"], correct: "卦爻" },
  { content: "“天行健，君子以自强不息”出自哪部经典？", answers: ["《周易》", "《诗经》", "《论语》", "《史记》"], correct: "《周易》" },
  { content: "“地势坤，君子以厚德载物”出自哪部经典？", answers: ["《周易》", "《孟子》", "《大学》", "《汉书》"], correct: "《周易》" },
  { content: "《春秋》在体例上属于哪类史书？", answers: ["编年体史书", "纪传体史书", "国别体史书", "断代纪事本末"], correct: "编年体史书" },
  { content: "中国科举制度一般认为正式创立于哪个朝代？", answers: ["隋代", "秦代", "西汉", "元代"], correct: "隋代" },
  { content: "明清科举考试最主要的取材范围是？", answers: ["四书五经", "兵书战策", "算学律历", "农书医书"], correct: "四书五经" },
  { content: "殿试通常由谁主持或亲自定名次？", answers: ["皇帝", "县令", "书院山长", "商会会首"], correct: "皇帝" },
  { content: "乡试考中者通常称为什么？", answers: ["举人", "秀才", "贡士", "进士"], correct: "举人" },
  { content: "会试考中者通常称为什么？", answers: ["贡士", "举人", "秀才", "童生"], correct: "贡士" },
  { content: "童试考中入学者俗称什么？", answers: ["秀才", "举人", "贡士", "状元"], correct: "秀才" },
  { content: "殿试录取后通常称为什么？", answers: ["进士", "举人", "生员", "监生"], correct: "进士" },
  { content: "乡试第一名称为什么？", answers: ["解元", "会元", "状元", "榜眼"], correct: "解元" },
  { content: "会试第一名称为什么？", answers: ["会元", "解元", "状元", "探花"], correct: "会元" },
  { content: "殿试第一甲第一名称为什么？", answers: ["状元", "榜眼", "探花", "会元"], correct: "状元" },
  { content: "殿试第一甲第二名称为什么？", answers: ["榜眼", "状元", "探花", "解元"], correct: "榜眼" },
  { content: "殿试第一甲第三名称为什么？", answers: ["探花", "榜眼", "会元", "贡士"], correct: "探花" },
  { content: "“连中三元”指连续取得哪三项第一？", answers: ["解元、会元、状元", "秀才、举人、进士", "童生、生员、贡士", "榜眼、探花、状元"], correct: "解元、会元、状元" },
  { content: "“秋闱”通常指哪一级考试？", answers: ["乡试", "会试", "殿试", "童试"], correct: "乡试" },
  { content: "“春闱”通常指哪一级考试？", answers: ["会试", "乡试", "童试", "院试"], correct: "会试" },
  { content: "八股文在明清科举中又常被称为什么？", answers: ["制义", "骈赋", "传奇", "章回"], correct: "制义" },
  { content: "“策问”类题目更偏向考察什么？", answers: ["经义政事的议论能力", "弓马骑射", "市井买卖", "丹药炼制"], correct: "经义政事的议论能力" },
  { content: "古代国子监主要是什么机构？", answers: ["中央官学", "民间商会", "地方驿站", "军械作坊"], correct: "中央官学" },
  { content: "古代书院的主要功能更接近哪一项？", answers: ["讲学育才", "开仓放粮", "铸造钱币", "操练水军"], correct: "讲学育才" },
  { content: "《史记》的作者是谁？", answers: ["司马迁", "司马光", "班固", "陈寿"], correct: "司马迁" },
  { content: "《资治通鉴》的主编是谁？", answers: ["司马光", "司马迁", "欧阳修", "刘勰"], correct: "司马光" },
  { content: "《汉书》的作者通常认为是谁？", answers: ["班固", "陈寿", "范晔", "司马迁"], correct: "班固" },
  { content: "《三国志》的作者是谁？", answers: ["陈寿", "罗贯中", "司马光", "班固"], correct: "陈寿" },
  { content: "《文心雕龙》的作者是谁？", answers: ["刘勰", "钟嵘", "萧统", "韩愈"], correct: "刘勰" },
  { content: "杜甫常被后世称为什么？", answers: ["诗圣", "诗仙", "诗佛", "诗鬼"], correct: "诗圣" },
  { content: "李白常被后世称为什么？", answers: ["诗仙", "诗圣", "诗佛", "诗囚"], correct: "诗仙" },
  { content: "下列哪位不属于“唐宋八大家”？", answers: ["李白", "韩愈", "柳宗元", "苏轼"], correct: "李白" },
  { content: "《岳阳楼记》的作者是谁？", answers: ["范仲淹", "欧阳修", "苏轼", "王安石"], correct: "范仲淹" },
  { content: "《醉翁亭记》的作者是谁？", answers: ["欧阳修", "范仲淹", "苏洵", "曾巩"], correct: "欧阳修" },
  { content: "《赤壁赋》的作者是谁？", answers: ["苏轼", "苏辙", "王安石", "黄庭坚"], correct: "苏轼" },
  { content: "《春江花月夜》的作者是谁？", answers: ["张若虚", "李贺", "孟浩然", "王维"], correct: "张若虚" },
  { content: "“千里之行，始于足下”常见出处是哪部书？", answers: ["《老子》", "《孟子》", "《诗经》", "《礼记》"], correct: "《老子》" },
  { content: "“道可道，非常道”出自哪部书？", answers: ["《道德经》", "《论语》", "《尚书》", "《史记》"], correct: "《道德经》" },
  { content: "“青，取之于蓝，而青于蓝”出自哪部典籍？", answers: ["《荀子》", "《论语》", "《孟子》", "《大学》"], correct: "《荀子》" },
  { content: "《齐民要术》的作者是谁？", answers: ["贾思勰", "徐光启", "宋应星", "李时珍"], correct: "贾思勰" },
  { content: "《农政全书》的作者是谁？", answers: ["徐光启", "贾思勰", "沈括", "祖冲之"], correct: "徐光启" },
  { content: "《天工开物》的作者是谁？", answers: ["宋应星", "徐霞客", "李时珍", "毕昇"], correct: "宋应星" },
  { content: "《本草纲目》的作者是谁？", answers: ["李时珍", "华佗", "张仲景", "孙思邈"], correct: "李时珍" },
  { content: "《九章算术》属于哪一类古代著作？", answers: ["数学著作", "兵法著作", "医药著作", "诗歌总集"], correct: "数学著作" },
  { content: "中国古代“四大发明”不包括哪一项？", answers: ["地动仪", "造纸术", "印刷术", "火药"], correct: "地动仪" },
  { content: "秦朝在全国推行的地方行政制度主要是？", answers: ["郡县制", "分封制", "行省制", "世卿世禄制"], correct: "郡县制" },
  { content: "科举制度废除于哪一年？", answers: ["1905年", "1840年", "1911年", "1898年"], correct: "1905年" },
  { content: "“金榜题名”中的“金榜”最贴近哪种含义？", answers: ["科举录取榜", "店铺账册", "军功名册", "族谱排行"], correct: "科举录取榜" },
  { content: "“文章合为时而著，歌诗合为事而作”常用来强调什么？", answers: ["文章应关切现实", "文章只求辞藻", "诗歌不可议论", "读书不问世事"], correct: "文章应关切现实" },
  { content: "“先天下之忧而忧，后天下之乐而乐”出自哪篇文章？", answers: ["《岳阳楼记》", "《醉翁亭记》", "《出师表》", "《赤壁赋》"], correct: "《岳阳楼记》" },
  { content: "“醉翁之意不在酒”出自哪篇文章？", answers: ["《醉翁亭记》", "《岳阳楼记》", "《桃花源记》", "《归去来兮辞》"], correct: "《醉翁亭记》" },
  { content: "《出师表》的作者是谁？", answers: ["诸葛亮", "曹操", "王羲之", "陶渊明"], correct: "诸葛亮" },
  { content: "《兰亭集序》的作者是谁？", answers: ["王羲之", "颜真卿", "欧阳询", "柳公权"], correct: "王羲之" },
  { content: "“书圣”通常指哪位书法家？", answers: ["王羲之", "颜真卿", "苏轼", "赵孟頫"], correct: "王羲之" },
  { content: "“颜筋柳骨”里的“颜”指谁？", answers: ["颜真卿", "颜回", "颜师古", "颜之推"], correct: "颜真卿" },
  { content: "“颜筋柳骨”里的“柳”指谁？", answers: ["柳公权", "柳宗元", "柳永", "柳开"], correct: "柳公权" },
  { content: "“桃李不言，下自成蹊”常用来称赞什么？", answers: ["德行感人", "言辞锋利", "武艺高强", "财货丰厚"], correct: "德行感人" },
  { content: "“纸上得来终觉浅，绝知此事要躬行”强调什么？", answers: ["实践", "辞章", "门第", "占卜"], correct: "实践" },
];
const SUPPLEMENTAL_PALACE_TOPICS = [
  { title: "农桑为国本", prompt: "地方连年歉收，百姓疲敝。请论劝农、赈济、减役三者如何并行。", themes: ["民本", "务实", "仁政"], styles: ["平实", "典雅", "激切"], result: "策论切中民瘼，朝臣多有称许。" },
  { title: "刑赏与教化", prompt: "盗案渐多，若一味严刑恐伤民心。请论法度、教化与吏治之先后。", themes: ["法度", "教化", "吏治"], styles: ["严整", "温厚", "锋利"], result: "所论兼顾刑名与教化，颇合上意。" },
  { title: "边防与民力", prompt: "边郡告急而府库不足。请论屯田、练兵与休养生息的取舍。", themes: ["边防", "民力", "筹饷"], styles: ["沉稳", "雄健", "缜密"], result: "策中有守有攻，主考称其不为空谈。" },
  { title: "盐铁利病", prompt: "盐铁之利归公则富国，过急则扰民。请论利权与民生如何相济。", themes: ["财赋", "民生", "权衡"], styles: ["谨严", "明快", "委婉"], result: "文章能辨利害，不失经世之意。" },
  { title: "水利与荒政", prompt: "河道失修，旱涝频仍。请论水利、仓储、迁民三策的轻重。", themes: ["水利", "荒政", "仓储"], styles: ["朴厚", "条达", "刚正"], result: "条陈清楚，足见平日留心民事。" },
  { title: "取士与用人", prompt: "科名未必尽得真才，荐举又恐徇私。请论取士、考课与任官之法。", themes: ["取士", "考课", "公正"], styles: ["典雅", "峻切", "平和"], result: "所答既尊科名，又能言考课之弊。" },
];
const SUPPLEMENTAL_LITERACY_QUESTIONS = [
  { content: "“仁”的常见含义更接近哪一项？", answers: ["爱人、仁德", "刑罚", "仓廪", "军阵"], correct: "爱人、仁德" },
  { content: "“义”的常见含义更接近哪一项？", answers: ["合宜、公正", "美貌", "粮价", "兵器"], correct: "合宜、公正" },
  { content: "“礼”的常见含义更接近哪一项？", answers: ["礼法、仪节", "雨水", "车马", "草木"], correct: "礼法、仪节" },
  { content: "“智”的常见含义更接近哪一项？", answers: ["明辨、智慧", "贫困", "疾病", "仓库"], correct: "明辨、智慧" },
  { content: "“信”的常见含义更接近哪一项？", answers: ["诚实、守约", "远行", "争斗", "木器"], correct: "诚实、守约" },
  { content: "“孝”主要指向哪种德行？", answers: ["敬养父母", "善于骑射", "精通货殖", "擅长医术"], correct: "敬养父母" },
  { content: "“悌”主要指向哪种德行？", answers: ["敬爱兄长", "拒绝读书", "征收田税", "修筑城墙"], correct: "敬爱兄长" },
  { content: "“忠”在传统语境里常指什么？", answers: ["尽心职守", "贪图私利", "逃避责任", "巧言令色"], correct: "尽心职守" },
  { content: "“恕”常见解释更接近哪一项？", answers: ["推己及人", "勇猛冲阵", "积谷防饥", "雕梁画栋"], correct: "推己及人" },
  { content: "“廉”常与哪种操守相连？", answers: ["清正不贪", "富贵奢华", "年少轻狂", "酒量过人"], correct: "清正不贪" },
  { content: "偏旁“氵”通常与哪类含义有关？", answers: ["水", "火", "金石", "衣物"], correct: "水" },
  { content: "偏旁“木”通常与哪类含义有关？", answers: ["树木", "口舌", "道路", "疾病"], correct: "树木" },
  { content: "偏旁“言”通常与哪类含义有关？", answers: ["言语", "鱼虫", "山川", "钱帛"], correct: "言语" },
  { content: "偏旁“心”或“忄”常与哪类含义有关？", answers: ["情志", "兵器", "车马", "田亩"], correct: "情志" },
  { content: "“温故知新”常指什么？", answers: ["复习旧知而有新悟", "冬日取暖", "重修房屋", "反复买卖"], correct: "复习旧知而有新悟" },
  { content: "“格物致知”常指什么？", answers: ["推究事物以求知识", "修筑城郭", "买卖货物", "整理家谱"], correct: "推究事物以求知识" },
  { content: "“见贤思齐”常指什么？", answers: ["见到贤者便想学习看齐", "看见钱财便想收藏", "见到敌军便整队", "见到山川便作画"], correct: "见到贤者便想学习看齐" },
  { content: "“不耻下问”常指什么？", answers: ["不以向地位低者请教为耻", "不喜欢问路", "不愿下田", "不肯写字"], correct: "不以向地位低者请教为耻" },
  { content: "“成人之美”常指什么？", answers: ["成全别人的好事", "修饰容貌", "成年后考学", "做成器物"], correct: "成全别人的好事" },
  { content: "“舍生取义”常指什么？", answers: ["为道义不惜生命", "舍弃读书去经商", "放弃义理求名利", "离家远游"], correct: "为道义不惜生命" },
  { content: "“一日三省吾身”强调什么？", answers: ["经常反省自己", "每日三餐", "三次点卯", "三次巡夜"], correct: "经常反省自己" },
  { content: "“克己复礼”更接近哪种修养？", answers: ["约束自身，回归礼法", "克扣粮饷", "修理礼器", "复查账本"], correct: "约束自身，回归礼法" },
  { content: "“博闻强识”常用来形容什么？", answers: ["见闻广博、记忆力强", "体魄强健", "家财万贯", "声音洪亮"], correct: "见闻广博、记忆力强" },
  { content: "“慎独”强调人在何时仍要自律？", answers: ["独处无人监督时", "众人宴饮时", "上朝奏对时", "行军打仗时"], correct: "独处无人监督时" },
  { content: "“知行合一”更强调什么关系？", answers: ["认识与实践统一", "诗与画统一", "官与商统一", "药与食统一"], correct: "认识与实践统一" },
  { content: "“君子慎其独也”中的“独”更接近哪种情境？", answers: ["独处", "独占", "独子", "独木"], correct: "独处" },
  { content: "“民惟邦本”常强调什么？", answers: ["百姓是国家根本", "城墙是国家根本", "货币是国家根本", "宫苑是国家根本"], correct: "百姓是国家根本" },
  { content: "“仓廪实而知礼节”常表达什么意思？", answers: ["民生安定有助于教化", "仓库越大官越高", "礼节只在粮仓举行", "读书不需衣食"], correct: "民生安定有助于教化" },
  { content: "“水至清则无鱼”常用来提醒为政者什么？", answers: ["察人处事不可过苛", "水要天天过滤", "捕鱼要用清水", "河道不可修整"], correct: "察人处事不可过苛" },
  { content: "“兼听则明，偏信则暗”强调什么？", answers: ["多方听取意见", "夜间点灯", "只信亲友", "少看公文"], correct: "多方听取意见" },
  { content: "“居安思危”常指什么？", answers: ["安定时也要想到危难", "居住必须靠山", "遇危先安家", "安居就不用读书"], correct: "安定时也要想到危难" },
  { content: "“防微杜渐”常指什么？", answers: ["在小问题初起时防止扩大", "修补堤岸", "预防蚊虫", "渐渐读书"], correct: "在小问题初起时防止扩大" },
];
const GAMBLE_DICE_COUNT = 6;
const GAMBLE_TOTAL_DICE = GAMBLE_DICE_COUNT * 2;
const GAMBLE_MIN_STAKE = 10;
const GAMBLE_STAKE_OPTIONS = [10, 20, 50, 100, 200, 500];
const GUESS_DICE_COUNT = 3;
const GUESS_ROUND_OPTIONS = [1, 3, 5];
const GUESS_KIND_OPTIONS = [
  { id: "size", label: "押大小", note: "押大、小或豹子" },
  { id: "sum", label: "押点数", note: "押三骰总点" },
  { id: "triple", label: "押全骰", note: "押三枚同点" },
];
const BIG_SMALL_DICE_COUNT = 3;
const BIG_SMALL_CHOICES = [
  { id: "big", label: "大", note: "总点数 11-17，豹子不算大", multiplier: 1 },
  { id: "small", label: "小", note: "总点数 4-10，豹子不算小", multiplier: 1 },
  { id: "same", label: "豹子", note: "三枚同点，五倍赔付", multiplier: 5 },
];
const PAI_GOW_TILES = [
  ["天", [6, 6], 16], ["天", [6, 6], 16],
  ["地", [1, 1], 15], ["地", [1, 1], 15],
  ["人", [4, 4], 14], ["人", [4, 4], 14],
  ["和", [1, 3], 13], ["和", [1, 3], 13],
  ["梅", [5, 5], 12], ["梅", [5, 5], 12],
  ["长", [3, 3], 11], ["长", [3, 3], 11],
  ["板", [2, 2], 10], ["板", [2, 2], 10],
  ["斧", [5, 6], 9], ["斧", [5, 6], 9],
  ["红", [4, 6], 8], ["红", [4, 6], 8],
  ["高", [1, 6], 7], ["高", [1, 6], 7],
  ["零", [1, 5], 6], ["零", [1, 5], 6],
  ["九", [4, 5], 5], ["九", [4, 5], 5],
  ["八", [3, 5], 4], ["八", [3, 5], 4],
  ["七", [2, 5], 3], ["七", [2, 5], 3],
  ["六", [2, 4], 2], ["六", [2, 4], 2],
  ["五", [2, 3], 1], ["五", [2, 3], 1],
].map(([name, pips, order], index) => ({ id: `pai-${index}`, name, pips, order }));
const PAI_GOW_GROUPS = [
  { id: "front", label: "前手", note: "先与庄家前手比" },
  { id: "back", label: "后手", note: "再与庄家后手比" },
];
const PAI_GOW_AUTO_SPLITS = [
  { id: "12-34", label: "一二 / 三四", groups: [[0, 1], [2, 3]] },
  { id: "13-24", label: "一三 / 二四", groups: [[0, 2], [1, 3]] },
  { id: "14-23", label: "一四 / 二三", groups: [[0, 3], [1, 2]] },
];
const OFFICIAL_RANKS = [
  { grade: "未入流", office: "县衙书吏", scope: "县衙", duty: "抄录文书、传递案牍，在县衙里熟悉规矩。" },
  { grade: "从九品", office: "县典史", scope: "县衙", duty: "分掌缉捕、仓库与杂务，是入仕后的低阶实缺。" },
  { grade: "正九品", office: "县主簿", scope: "县衙", duty: "佐理钱粮户籍，替知县分担日常案牍。" },
  { grade: "从八品", office: "县丞", scope: "县衙", duty: "协理一县政务，能独当一面处置乡里事务。" },
  { grade: "正八品", office: "县学教谕", scope: "县学", duty: "掌一县教化与生员，名望渐出县门。" },
  { grade: "从七品", office: "州判", scope: "州署", duty: "辅佐州官，理刑名钱谷，开始接触州一级政务。" },
  { grade: "正七品", office: "知县", scope: "一县", duty: "亲掌一县民政刑名，是百姓口中的父母官。" },
  { grade: "从六品", office: "州同", scope: "州署", duty: "参办州务，兼管河工、仓储、驿传等差。" },
  { grade: "正六品", office: "通判", scope: "府州", duty: "佐理府州大政，可会审疑案、稽查钱粮。" },
  { grade: "从五品", office: "同知", scope: "府署", duty: "分守一方要务，政声足以传到上司案头。" },
  { grade: "正五品", office: "知州", scope: "州府", duty: "主理一州民政，治绩优劣牵动数县百姓。" },
  { grade: "从四品", office: "知府", scope: "一府", duty: "统辖府中州县，案牍、钱粮、教化都要过问。" },
  { grade: "正四品", office: "道员", scope: "一道", duty: "巡察数府，掌盐粮河工或兵备，权责更重。" },
  { grade: "从三品", office: "按察使", scope: "一省", duty: "掌一省刑名监察，清浊善恶皆须明断。" },
  { grade: "正三品", office: "布政使", scope: "一省", duty: "掌一省钱粮民政，府县升黜亦常听其考语。" },
  { grade: "从二品", office: "巡抚", scope: "一省", duty: "巡抚一省军民，奏折直达朝廷。" },
  { grade: "正二品", office: "总督", scope: "数省", duty: "总督军政，统筹数省粮饷、兵备与边防。" },
  { grade: "从一品", office: "尚书", scope: "六部", duty: "入掌部务，议天下钱粮礼刑工兵之政。" },
  { grade: "正一品", office: "大学士", scope: "朝堂", duty: "入阁参赞机务，位极人臣，名入国史。" },
];
const OFFICIAL_PROMOTION_MERIT = [0, 70, 155, 255, 375, 520, 690, 890, 1125, 1400, 1720, 2090, 2510, 2990, 3530, 4140, 4820, 5570, 6400];
const GAMBLE_OPPONENT_ITEMS = ["孔雀华盖马车", "乌木折扇", "鎏金酒盏", "玉扣腰牌", "一匣银锭", "绣纹荷包"];
const CHINESE_NUMS = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"];
const GOMOKU_SIZE = 15;
const XIANGQI_ROWS = 10;
const XIANGQI_COLS = 9;
const TOUHU_ARROW_COUNT = 5;
const MINI_GAME_TABS = [
  ["gomoku", "五子棋"],
  ["touhu", "投壶"],
  ["xiangqi", "象棋"],
];
const XIANGQI_VALUES = { K: 10000, R: 900, C: 450, N: 400, B: 220, A: 220, P: 120 };
const XIANGQI_AI_DEPTH = 2;
const XIANGQI_AI_CANDIDATE_LIMIT = 18;
const XIANGQI_AI_REPLY_LIMIT = 10;

const TOP_SHORTCUTS = [
  { id: "travel", label: "车马", icon: "RepairCarriage" },
  { id: "backpack", label: "行囊", icon: "Backpack" },
  { id: "ledger", label: "账本", icon: "CashBox" },
  { id: "menu", label: "菜单", icon: "Menu" },
];

const THEATER_WATCH_STORIES = [
  {
    title: "瓦舍听书",
    icon: "MainBook",
    text: "说书先生拍案讲到旧朝奇案，满座屏息。你听出其中几分人情曲折，散场后还与邻座争论了半盏茶。",
    effects: { mood: [4, 8], eq: [1, 4], knowledge: [1, 3] },
  },
  {
    title: "瓦舍观戏",
    icon: "Activity",
    text: "台上生旦净末轮番登场，一折忠义戏唱到紧处，连卖茶的小厮都停了手。你心中郁气被锣鼓敲散。",
    effects: { mood: [5, 10], virtue: [0, 2] },
  },
  {
    title: "杂耍惊座",
    icon: "Game",
    text: "有伶人抛丸走索，足尖悬在细绳上，下面喝彩声如潮。你看得掌心生汗，倒也学到几分临场镇定。",
    effects: { mood: [3, 7], physique: [0, 2], eq: [1, 3] },
  },
  {
    title: "曲终识友",
    icon: "Relationship1",
    text: "散场时一位同好与你评曲，说到板眼处颇有见地。两人越谈越投契，互留姓名，约定下回再同听一出。",
    effects: { mood: [3, 7], relationship: [3, 8], eq: [1, 3] },
    friend: true,
  },
  {
    title: "梨园手札",
    icon: "Book",
    text: "后台老伶人见你听得认真，递来一页旧抄戏词。纸边磨旧，唱腔批注却清楚，你收好后觉得颇有意味。",
    effects: { mood: [2, 6], knowledge: [2, 5] },
    item: "旧戏折",
  },
  {
    title: "瓦舍争座",
    icon: "DisputesAmongCivilians",
    text: "前排有人为争座位吵嚷，几乎掀翻茶案。你出面劝了两句，虽错过开场，却让旁人记住你几分圆融。",
    effects: { mood: [-2, 2], eq: [2, 5], favorability: [0, 2] },
  },
];

const PLEASURE_STORIES = [
  {
    title: "花酒酬客",
    icon: "Wine1",
    text: "席间有人强劝你斗酒，你借笑谈转开话头，既不扫兴，也没失了分寸。临别时席上诸人都高看你一眼。",
    cost: [100, 210],
    effects: { mood: [4, 9], eq: [2, 5], relationship: [2, 6], virtue: [-3, -1] },
  },
  {
    title: "红袖添香",
    icon: "FlowerChiefTitle",
    text: "一名歌妓见你谈吐不俗，低声与你讲起城中贵客往来。消息真假参半，却足够你窥见几分世情。",
    cost: [120, 260],
    effects: { mood: [5, 10], eq: [2, 5], knowledge: [1, 4], virtue: [-5, -2] },
  },
  {
    title: "酒后失言",
    icon: "AwkwardStatus",
    text: "你酒意上头，席间一句戏言惹得邻桌冷眼。散场后虽无人追究，名声却难免沾了些浮浪气。",
    cost: [80, 180],
    effects: { mood: [-4, 2], eq: [-4, -1], favorability: [-3, -1], virtue: [-5, -2] },
  },
  {
    title: "风月染疾",
    icon: "Hospital",
    text: "一夜欢场散尽，回家后你觉得身上发冷、心口烦闷。医者说多半是酒色伤身，需好生调养。",
    cost: [130, 280],
    effects: { mood: [-4, 2], physique: [-8, -3], virtue: [-6, -2] },
    disease: ["风寒", "花柳暗疾", "惊悸"],
  },
  {
    title: "豪客赏识",
    icon: "CashBox",
    text: "席上豪客听你谈吐有趣，临走时反替你结了半桌酒账，还邀你日后同游。此行竟少花了些钱。",
    cost: [40, 120],
    effects: { mood: [4, 9], relationship: [4, 9], eq: [1, 4], virtue: [-3, -1] },
    friend: true,
  },
  {
    title: "赎身传闻",
    icon: "Letter",
    text: "有女子托人递来一封短笺，说自己被迫入此行，盼有人代为传信。你收下信，却也知此事牵扯不浅。",
    cost: [90, 190],
    effects: { mood: [-2, 4], virtue: [1, 4], eq: [1, 3] },
    item: "风月短笺",
  },
];

const COURTESAN_MIN_AGE = 18;
const COURTESAN_ROUNDS = [
  {
    id: "talent",
    label: "才艺展示",
    action: "欣赏",
    note: "听琴、观舞、看诗画，眼力与学识会影响你能否看出妙处。",
  },
  {
    id: "wit",
    label: "机锋问答",
    action: "问答",
    note: "席上出题试才情，处世与德行越高，越能问出佳句。",
  },
  {
    id: "gift",
    label: "赠礼助兴",
    action: "赠礼",
    note: "以花笺、绢帕或金钗助兴，能推高支持，也可能折损德行。",
  },
];
const COURTESAN_SPECIALTIES = [
  { name: "琵琶", icon: "BambooFlute", text: "指下急雨落银瓶，最擅一曲边塞旧调。" },
  { name: "昆曲", icon: "Activity", text: "唱腔婉转，水袖一翻，满堂都静了下来。" },
  { name: "诗词", icon: "Book", text: "临席成句，善把离合悲欢写进短笺。" },
  { name: "舞袖", icon: "FlowerChiefTitle", text: "长袖回风，步步踩在鼓点与灯影里。" },
  { name: "琴艺", icon: "FemaleSkill", text: "琴声清越，不求喧哗，却最能入人心。" },
  { name: "说唱", icon: "MainBook", text: "能把市井故事唱得跌宕，惹得满座喝彩。" },
];
const COURTESAN_PORTRAITS = [
  "assets/courtesan-avatar-1.webp",
  "assets/courtesan-avatar-2.webp",
  "assets/courtesan-avatar-3.webp",
  "assets/courtesan-avatar-4.webp",
];
const PLAYER_AVATARS = {
  male: [
    "assets/player-avatar-male-1.webp",
    "assets/player-avatar-male-2.webp",
    "assets/player-avatar-male-3.webp",
    "assets/player-avatar-male-4.webp",
  ],
  female: COURTESAN_PORTRAITS,
};
const COURTESAN_BACKGROUNDS = [
  "出身梨园，自幼随师学艺，最看重知音二字。",
  "曾在富户家教习女乐，谈吐温雅，心思细密。",
  "家道中落后入坊，仍藏着几卷旧书与一身傲气。",
  "随商队辗转诸城，见多识广，能讲各地奇闻。",
  "被老鸨重点栽培，场面功夫圆熟，也懂得自保。",
  "性情清冷，不爱争宠，只在曲中藏锋。",
];
const COURTESAN_QUESTIONS = [
  "若忠孝难两全，何者为先？",
  "一首诗最贵风骨，还是最贵情真？",
  "富贵人家相争，平民该不该卷入？",
  "遇知己赏识，是当守身自重，还是乘势改命？",
  "官场贵人邀饮，如何既不失礼又不失身段？",
  "风月场中一句承诺，究竟值几分真心？",
];

const MAIN_DOORS = [
  { id: "home", label: "家中", icon: "FamilyIcon" },
  { id: "assets", label: "家产", icon: "House" },
  { id: "relations", label: "亲友", icon: "FamilyIcon" },
  { id: "activities", label: "活动", icon: "Activity" },
];

const ACTIVITY_PLACES = [
  { id: "medicine", label: "医馆", icon: "MedicineBag", minAge: 6, note: "问诊、养生、研读医书。", activities: ["medicine"] },
  { id: "inn", label: "客栈", icon: "Restaurant", minAge: 6, note: "吃酒小坐，也能听见四方消息。", activities: ["restaurant", "news", "flowerwine"] },
  { id: "official", label: "官府", icon: "Official", minAge: 15, note: "县务案牍、牢狱查问都在此处。", activities: ["administration", "prison"] },
  { id: "matchmaker", label: "媒人", icon: "ArrangeMarriage", minAge: 16, note: "问姻缘、托媒人相看人家。", special: "matchmaker" },
  { id: "casino", label: "博坊", icon: "GamblingHouse", minAge: 15, note: "押数博戏，胜负皆伤心动财。", special: "gamble" },
  { id: "parlor", label: "雅戏", icon: "BambooFlute", minAge: 6, note: "五子棋、投壶等清雅游艺，可消磨半日。", special: "miniGames" },
  { id: "theater", label: "瓦舍风月", icon: "Whorehouse", minAge: 6, note: "听曲看戏，成年后也可入花酒风月。", special: "theater" },
  { id: "friends", label: "会友", icon: "FamilyIcon", minAge: 6, note: "探亲访友，关系冷暖都在往来。", activities: ["family", "sister", "restaurant"], special: "friend" },
  { id: "academy", label: "书院", icon: "Book", minAge: 8, note: "温书求学，也可由此参加科举。", activities: ["academy"], exam: true },
  { id: "temple", label: "寺庙", icon: "Temple", minAge: 6, note: "焚香问卜，修身也修心。", activities: ["temple"] },
  { id: "farm", label: "农田", icon: "Agriculture", minAge: 6, note: "查问农桑，体会民生。", activities: ["agriculture"] },
  { id: "alchemy", label: "丹房", icon: "Elixir", minAge: 15, note: "炉火药烟，成败皆有风险。", activities: ["alchemy"] },
  { id: "cricket", label: "促织", icon: "Cricket", minAge: 10, note: "捕虫、斗虫、参加促织大赛。", special: "cricket" },
  { id: "market", label: "市集", icon: "BookStore", minAge: 6, note: "购置书卷杂物，也可撞见黑市。", special: "market" },
  { id: "party", label: "宴会", icon: "DrinkingWine", minAge: 16, note: "赴宴会友，结交名流。", special: "party" },
  { id: "womenSchool", label: "女学", icon: "FemaleSkill", minAge: 8, note: "女子可修习闺塾技艺。", special: "womenSchool" },
];

const CUSTOM_CAREERS = [
  {
    name: "镖师行商",
    customKind: "caravan",
    icon: "RepairCarriage",
    assumeText: "押镖护货、结队行商。风险越高，收益越厚，也可能受伤甚至身故。",
    desc: "路线选择、遭遇事件、成功失败收益与风险并存。",
  },
];

const CAREER_STORY_OVERRIDES = {
  县衙户房: {
    summary: "掌户籍、田亩、钱粮簿册。数字错一笔，百姓一年都要跟着折腾。",
    join: "你进了县衙户房，从点校户籍、清算钱粮做起。纸上皆是数字，数字背后却是一户户人家。",
    routine: ["你核对田亩册，发现一处重赋旧案，替乡民免去一笔冤钱。", "岁终催粮，里正与粮户各执一词，你夹在账册与人情之间，终于理出清楚数目。"],
    case: ["有逃户冒名顶籍，你翻旧册、问保甲，查出其中蹊跷。", "一户贫民求缓缴秋粮，你斟酌灾情与县库，写下折中呈文。"],
  },
  县衙吏房: {
    summary: "掌吏员考课、文书出入。衙门里谁升谁黜，先要过这一房案头。",
    join: "你入了吏房，日日抄录官牒、传阅札文，也渐渐摸到县衙运转的门道。",
    routine: ["你整理吏员考课簿，替上司补齐多年的缺页。", "新任巡检到县，你连夜备齐履历文案，使交接顺当。"],
    case: ["有人托情改考语，你推说旧例森严，婉转挡了回去。", "一名书吏私藏公文，你从收发簿里查出破绽。"],
  },
  县主簿: {
    summary: "佐理县令，统文书、钱粮与案牍。虽非正印，却是县衙枢纽。",
    join: "你升任县主簿，开始替县令分理案牍，凡钱粮刑名都须经手。",
    routine: ["你按日排定各房公事，让积压文卷少了许多。", "县令外出巡乡，你留守衙中，连办三件急牒。"],
    case: ["两房互相推诿旧案，你召齐书吏当面对簿，终于定责。", "上司忽查库银，你提前补齐账目，使县衙免了一场惊险。"],
  },
  县丞: {
    summary: "辅佐知县，分管仓廪、河工、治安。事不算最高，却件件压身。",
    join: "你做了县丞，开始独当一面。仓粮、河堤、巡捕，皆要你亲自督看。",
    routine: ["你巡查义仓，发现霉粮混入新谷，当场责令重晒。", "河堤雨后裂开，你带人连夜加固，保住下游村庄。"],
    case: ["乡间械斗将起，你赶在族老聚众前调停，免了流血。", "仓吏亏空粮石，你一面查账一面安抚灾民。"],
  },
  县衙刑房: {
    summary: "掌刑名案卷、狱讼口供。笔下一句轻重，牵动人命清白。",
    join: "你入了刑房，先从誊录供词做起。灯下每一页案卷，都有哭声和怨气。",
    routine: ["你校勘旧案供词，发现前后日期不合，提醒上官重审。", "狱中有人喊冤，你按例复核牒文，查出遗漏证人。"],
    case: ["盗案证物被调换，你从封条泥印上看出问题。", "邻里命案众说纷纭，你陪同勘验现场，辨出真正凶器。"],
  },
  县衙工房: {
    summary: "掌道路、桥梁、仓舍、水利。看似泥瓦木石，其实关乎一县生计。",
    join: "你入了工房，丈量桥道、核算木石，从此日日同匠户、河堤和账册打交道。",
    routine: ["你督修城南小桥，催齐木料，又压下工头虚报。", "县仓漏雨，你召匠户补瓦换梁，赶在秋粮入仓前完工。"],
    case: ["河工账目浮报，你沿堤查验石料，抓出偷工减料。", "驿路塌方断了商旅，你调集民夫绕山开出便道。"],
  },
  木匠: {
    summary: "量木、开榫、修屋造器。手上有准头，饭碗就有着落。",
    join: "你拜进木匠行，从刨花扫地、磨凿看线学起，木香渐渐浸进衣袖。",
    routine: ["你替人修一张老榆木桌，榫眼严丝合缝，主人连声称好。", "新宅上梁，你在梁头刻下吉语，众匠一同喝彩。"],
    masterwork: ["你闭门打造一座多宝格，暗格机关巧妙，士绅争相询价。", "庙里请你重修供案，你选老料细作，成品端正沉稳。"],
  },
  画师: {
    summary: "写真、绘卷、补壁。能画人形，也要看得懂人情。",
    join: "你入了画行，先为客人描影写真。笔墨之外，还要会听客人心事。",
    routine: ["你为一户人家画祖容，老人看罢久久不语，眼中泛泪。", "茶楼请你补一面山水屏风，来客驻足称赏。"],
    masterwork: ["你绘成《春江夜宴图》，灯影衣纹皆有生气，被雅客高价收去。", "你为寺壁补绘护法像，庄严之气使香客赞叹。"],
  },
  玉匠: {
    summary: "辨玉、琢佩、修残。玉石温润，刀下却容不得半点急躁。",
    join: "你入玉石行，日日听砂轮细响，从看料、磨边、抛光学起。",
    routine: ["你修好一枚裂纹玉佩，以金线补缺，反添古意。", "客人拿来青玉原石，你辨出棉裂，免了他一场亏损。"],
    masterwork: ["你琢成一对螭纹玉扣，纹路深浅有致，被富户定作聘礼。", "你用边角料雕出小兽，虽小却灵动，竟卖出好价。"],
  },
  琴师: {
    summary: "调弦授曲，宴席清供。弦上有风雅，也有客人的喜怒。",
    join: "你入乐坊做琴师，先从调弦陪练开始。席上一曲若合人心，便能换来赏钱与名声。",
    routine: ["你在茶舍弹《潇湘水云》，雨声入弦，满座渐渐安静。", "富家子弟学琴心浮气躁，你一遍遍带他按徽寻音。"],
    masterwork: ["你新谱一支慢曲，曲中有离亭秋色，听者皆说余味不尽。", "宴席上客人争论古调，你以一曲收场，席间顿生敬意。"],
  },
  铁匠: {
    summary: "打刀、修锅、铸农具。炉火旺时，半条街都听得见锤声。",
    join: "你进了铁匠行，拉风箱、递火钳、淬水听声，日日被炉火烤得满脸通红。",
    routine: ["你替农户打一批镰刀，刃口利落，赶上了秋收。", "驿卒的马掌坏了，你连夜重钉，使他天亮便能赶路。"],
    masterwork: ["你反复折打精铁，铸出一柄寒光短刀，武人见了不肯撒手。", "你为县衙修锁链刑具，火候拿捏稳当，工房也记了你的名。"],
  },
  跑堂: {
    summary: "迎客、传菜、记账、赔笑。脚步快，眼色更要快。",
    join: "你进客栈做跑堂，肩巾一搭，开始学着在热汤酒气里认人脸、听风声。",
    routine: ["午市客满，你穿桌过椅连送十几盘菜，竟一单也没错。", "外乡商客问路，你顺手指点驿道，换来几枚赏钱。"],
    case: ["楼上雅间来了贵客，你看准眼色添茶撤盏，掌柜暗暗点头。", "两桌客人酒后争吵，你赶在动手前端汤劝开。"],
  },
  伙夫: {
    summary: "掌灶火、切配、熬汤。锅边辛苦，却最懂一日烟火。",
    join: "你进后厨做伙夫，先从劈柴洗菜做起，灶火一起便没有闲手。",
    routine: ["你熬出一锅骨汤，香气从后厨飘到堂前，客人多添了两碗饭。", "灶间缺人，你一人顶两口锅，终于撑过晚市。"],
    case: ["县中宴席临时加菜，你翻出余料做成羹汤，反被客人夸有巧思。", "米面潮了，你赶忙晒粮筛虫，免得掌柜亏本。"],
  },
  车夫: {
    summary: "赶车识路，护客运货。晴走尘土，雨走泥浆。",
    join: "你在驿站做车夫，学认车辙、马性与各路脚程，从此风雨都在路上。",
    routine: ["你送一位老客过河桥，车轮陷泥，幸而稳住马头。", "商队赶夜路，你凭星斗认道，少绕了十里。"],
    risk: ["山路急弯马受惊，你死死勒住缰绳，险些翻车。", "雨夜送急信，路面湿滑，你一路不敢松手。"],
  },
  担夫: {
    summary: "肩挑货担，脚量街巷。力气是本钱，信誉也是本钱。",
    join: "你入了脚行做担夫，一根扁担两只筐，靠脚程与力气讨生活。",
    routine: ["你替商行送盐包到码头，肩头磨红，货却一件不少。", "集市拥堵，你抄小巷送货，准时赶到铺门。"],
    risk: ["山货沉重，石阶湿滑，你险些连人带担摔下去。", "远村急送药材，你咬牙赶路，天黑才回城。"],
  },
  禅师: {
    summary: "诵经、讲法、安人心。寺门清静，世事却常来敲门。",
    join: "你在寺中随师修习，晨钟暮鼓之间，也替香客解些心中困厄。",
    routine: ["你为亡者诵经，家属悲声渐止，临别时郑重合掌。", "香客问因果，你以浅近话语劝他放下执念。"],
    risk: ["荒寺夜半传来哭声，你持灯查看，原是逃难人藏身佛龛后。", "有人求你作法害人，你婉拒后仍觉心头沉重。"],
  },
  厨娘: {
    summary: "掌勺配菜，照看一桌烟火。菜做得好，客人自然记得你。",
    join: "你进了后厨做厨娘，洗切蒸煮都要上手，灶火一旺，半日不得闲。",
    routine: ["你做成一道清蒸鱼，火候正好，席上客人连声称鲜。", "厨房临时缺菜，你用边角料煨成小羹，反得掌柜夸奖。"],
    masterwork: ["你承办一席寿宴，冷盘热菜次第上桌，主人家十分体面。", "你试做一味花糕，色香皆妙，女客们问了又问做法。"],
  },
  歌姬: {
    summary: "登台唱曲，声色动人。曲中一转，便可能换来满座赏钱。",
    join: "你入了教坊歌席，从练嗓、记词、候场学起，知道台上风光皆由台下辛苦换来。",
    routine: ["你唱一支小令，尾音清亮，酒席上顿时安静下来。", "客人点旧曲，你临场改腔，竟比原调更添三分哀婉。"],
    masterwork: ["你新学一套长调，曲终余音未散，席间已有贵客打听你的名字。", "诗会请你唱和新词，你咬字清楚，替主人撑足了场面。"],
  },
  舞姬: {
    summary: "身段、节拍、眼波都要练。一步错，满座皆知；一步妙，满堂喝彩。",
    join: "你入舞班学艺，压腿转身、记拍换袖，每日下来双足酸疼。",
    routine: ["你在席间献一段软舞，袖影如云，客人看得入神。", "排练时鼓点忽乱，你仍稳住步法，带着同伴收住阵脚。"],
    masterwork: ["你编出一段《踏月舞》，月白衣袖翻飞，满座都说新鲜。", "宴中临时加演，你以剑舞收场，掌声几乎盖过鼓乐。"],
  },
  绣娘: {
    summary: "穿针引线，绣花补衣。针脚细密，名声也会一针针攒起来。",
    join: "你进了锦缎坊做绣娘，从描样、配色、走线开始学，眼睛常熬得发酸。",
    routine: ["你绣好一方荷花帕，针脚匀净，被客人当场买下。", "富户送来破损霞帔，你细细补纹，几乎看不出旧痕。"],
    masterwork: ["你接下一幅百蝶屏风，连绣数月，终于蝶翼生光。", "你为新嫁娘绣成鸳鸯被面，满屋亲眷都来细看。"],
  },
  妆娘: {
    summary: "梳头点妆，修眉配饰。镜前一刻，常能改人三分气色。",
    join: "你入了妆坊，学梳髻、调粉、配钗，渐渐懂得不同脸面该用不同手法。",
    routine: ["你替新妇梳成同心髻，铜镜里她终于露出笑意。", "女客嫌粉色太重，你重调脂粉，妆面顿时清透许多。"],
    masterwork: ["花宴前你替贵女定妆，眉眼明净，入席后人人侧目。", "你创出一套桃花妆，几日内便在坊间传开。"],
  },
  闺塾师: {
    summary: "教女童识字、女红与礼仪。课桌虽小，也能影响一户家风。",
    join: "你受聘为闺塾师，替人家女儿开蒙授课，字、礼、针线都要顾到。",
    routine: ["你教学生描红读诗，最顽皮的孩子也终于肯安静写完一页。", "女童们争论诗句，你顺势讲起典故，课堂一下活了起来。"],
    masterwork: ["你编了一册闺塾小课，识字、女红、礼仪次第清楚，主家很是满意。", "学生在家宴上应对得体，主母特意谢你教导有方。"],
  },
  道士: {
    summary: "画符、看风水、斋醮祈禳。半在香火，半在江湖。",
    join: "你随观中道士学步罡、写符、辨方位，渐渐也被人请去看宅安神。",
    routine: ["你为人家安宅，指出灶位冲煞，主人半信半疑却仍给了香火钱。", "庙会斋醮，你执幡随行，香烟中听见百姓祈愿。"],
    risk: ["夜里有人请你镇怪，你到场才知是家产纷争借鬼神作名。", "山中采药迷路，你循水声下行，险些误入旧坟地。"],
  },
  守墓人: {
    summary: "守陵巡夜，安魂护冢。荒草风声里，也有一份规矩。",
    join: "你接下守墓差事，夜里巡陵、白日修冢，与香灰、碑文和风声作伴。",
    routine: ["你补好一座倾斜墓碑，替远来祭扫的人寻回祖坟。", "夜巡时你赶走盗挖坟土的人，守住一处旧冢。"],
    risk: ["荒坟间忽有火光，你循迹过去，发现盗墓贼刚撬开墓砖。", "大雨冲开新坟，你冒雨填土，回去时浑身冰冷。"],
  },
  摸金校尉: {
    summary: "识穴探墓，财险并行。见金不难，难的是活着回来。",
    join: "你被黑袍人引入摸金一门，学分金定穴、听土辨空，也知此道最伤阴德。",
    routine: ["你替人辨一处古墓旧址，只取线索不动棺椁，仍得了酬金。", "你在废井旁听出空音，提醒同伴绕行，避开塌陷。"],
    risk: ["墓道中冷风倒灌，你当即喝止众人，下一刻前方石顶轰然塌下。", "你摸到一枚古钱，却也惊动暗藏机关，险险脱身。"],
  },
  弈师: {
    summary: "授棋、陪弈、拆局。棋盘十九道，落子皆是人心。",
    join: "你做了弈师，常在茶舍、书院间陪人对局，凭棋力换饭钱。",
    routine: ["你陪老先生下了一局细棋，收官时半目险胜。", "书生求你拆解败局，你点出急攻之弊，他若有所悟。"],
    masterwork: ["你设下一局珍珑，连胜三名好手，茶舍中顿时传开。", "宴席上有人以棋斗气，你三手化杀，替主人保住颜面。"],
  },
  茶师: {
    summary: "择水、候火、点茶待客。茶汤清淡，人情却很浓。",
    join: "你入茶舍为茶师，学辨水火、掌盏候客，慢慢懂得客人的口味与脾气。",
    routine: ["你以山泉点茶，汤色清亮，客人一饮便问产地。", "雅客争论新茶旧茶，你各泡一盏，让香气自己说话。"],
    masterwork: ["你调出一盏雪沫茶，茶面如云，被文士题诗称赞。", "贵客设茶会，你安排水火器具井然，茶舍名声更盛。"],
  },
};

const CAREER_ACTION_OVERRIDES = {
  县衙户房: [["routine", "核户清册", "清点户籍、田亩与钱粮，少错一笔便少一桩民怨。"], ["case", "查粮税案", "追查逃户冒籍、虚报田亩等疑案。"]],
  县衙吏房: [["routine", "整理官牒", "誊录札文、排定考课，衙门运转全靠这些细活。"], ["case", "查书吏弊", "有人在公文里做手脚，须从案卷中找破绽。"]],
  县主簿: [["routine", "分理案牍", "替县令统筹文书、钱粮和各房公事。"], ["case", "会审疑案", "召集各房对簿，厘清一桩棘手旧案。"]],
  县丞: [["routine", "巡仓河工", "查看义仓、河堤与巡捕事务，处处都要亲到。"], ["case", "平乡里事", "乡里争讼将起，须赶在事态扩大前处置。"]],
  县衙刑房: [["routine", "复核供词", "校对供词、证物与刑名文书。"], ["case", "勘查疑案", "随差役勘验现场，查明案情虚实。"]],
  县衙工房: [["routine", "督修桥仓", "督看桥梁、仓舍、驿路修缮。"], ["case", "查河工账", "追查木石、河工和匠役账目的猫腻。"]],
  木匠: [["routine", "接木作活", "修桌椅、做门窗，靠榫卯和准头吃饭。"], ["masterwork", "做机关器", "耗材耗神，若成便能打响名声。"]],
  画师: [["routine", "写真补壁", "为客写真、补屏、绘小幅。"], ["masterwork", "绘成名卷", "闭门经营一幅大画，成则名利双收。"]],
  玉匠: [["routine", "琢修玉佩", "修残、抛光、辨料，稳稳做一单活。"], ["masterwork", "雕玉名器", "好料难得，下刀更要谨慎。"]],
  琴师: [["routine", "抚琴授曲", "调弦、陪练、席间清供，以琴声得人情。"], ["masterwork", "新谱名曲", "闭门谱曲，若得赏识便能扬名。"]],
  铁匠: [["routine", "开炉打铁", "打农具、修马掌，炉火一旺便不得闲。"], ["masterwork", "锻造名器", "折打淬火，赌的是手艺和火候。"]],
  跑堂: [["routine", "堂前当值", "迎客传菜、记账赔笑，脚步和眼色都要快。"], ["case", "招待贵客", "雅间来客不凡，应对得宜便有赏钱。"]],
  伙夫: [["routine", "后厨掌灶", "洗切蒸煮、熬汤看火，撑过一日饭口。"], ["case", "承办宴席", "临时加菜、席面周全，最考验灶上本事。"]],
  车夫: [["routine", "驿路送客", "识路赶车，护客平安到达。"], ["risk", "接险路", "雨夜、山路或急信，来钱多也更伤身。"]],
  担夫: [["routine", "挑担送货", "肩挑货担，在街巷码头间讨生活。"], ["risk", "赶远脚", "路远货沉，收益和风险都高。"]],
  禅师: [["routine", "诵经讲法", "替香客讲经解惑，安顿人心。"], ["risk", "夜问幽事", "荒寺夜事未明，可能得善缘，也可能惹阴冷。"]],
  厨娘: [["routine", "后厨掌勺", "配菜掌火，做出一桌稳当饭食。"], ["masterwork", "办一席菜", "承办寿宴、花宴或家宴，成则名声渐起。"]],
  歌姬: [["routine", "登台唱曲", "唱小令、应点曲，声色皆要稳。"], ["masterwork", "献一支新声", "新调若入人心，席间便有人替你扬名。"]],
  舞姬: [["routine", "登台献舞", "随鼓点起舞，身段眼波皆要到位。"], ["masterwork", "编一支新舞", "新舞难排，若成便能压住全场。"]],
  绣娘: [["routine", "接一件绣活", "绣帕补衣，针脚细密才得客人放心。"], ["masterwork", "绣成大件", "屏风、嫁衣、被面，耗眼力也涨名声。"]],
  妆娘: [["routine", "梳妆待客", "梳髻、调粉、配钗，照看镜前气色。"], ["masterwork", "定一套名妆", "替贵客定妆，若传开便能招来新客。"]],
  闺塾师: [["routine", "授女学", "教识字、读诗、针线和礼仪。"], ["masterwork", "编闺塾课", "整理课本与教法，让主家看见成效。"]],
  弈师: [["routine", "陪客对弈", "陪棋、让子、复盘，靠棋力与耐心谋生。"], ["masterwork", "设局拆谱", "摆珍珑、拆名局，若破得漂亮便能扬名。"]],
  茶师: [["routine", "点茶待客", "择水候火，照看客人口味。"], ["masterwork", "主理茶会", "茶会器具、水火、茶汤都要稳妥。"]],
  道士: [["routine", "画符安宅", "写符、看宅、做小斋醮，换些香火钱。"], ["risk", "夜行镇怪", "夜里应召出门，真假鬼神都不好惹。"]],
  守墓人: [["routine", "巡陵护冢", "修碑、巡夜、看守墓园规矩。"], ["risk", "夜守荒坟", "荒坟风声诡异，盗墓贼与阴冷事都可能撞上。"]],
  摸金校尉: [["routine", "辨穴探踪", "听土、辨穴、探旧址，先看明白再动手。"], ["risk", "下墓探幽", "墓道里财险并行，稍错一步便难回头。"]],
};

const CARAVAN_ROUTES = [
  {
    id: "county",
    label: "近郊短镖",
    cost: 30,
    reward: [90, 170],
    risk: 18,
    stages: 2,
    exp: 22,
    deathRisk: 0,
    note: "路近货轻，适合初入镖局。",
  },
  {
    id: "merchant",
    label: "云州商路",
    cost: 80,
    reward: [180, 360],
    risk: 34,
    stages: 3,
    exp: 36,
    deathRisk: 0.01,
    note: "商队往来频繁，天气和盗匪都要防。",
  },
  {
    id: "frontier",
    label: "边关重镖",
    cost: 150,
    reward: [420, 820],
    risk: 54,
    stages: 4,
    exp: 58,
    deathRisk: 0.025,
    note: "路远货重，成则暴利，败则伤筋动骨。",
  },
  {
    id: "night",
    label: "夜走险货",
    cost: 220,
    reward: [650, 1250],
    risk: 68,
    stages: 4,
    exp: 72,
    deathRisk: 0.04,
    virtueLoss: true,
    note: "货主出手阔绰，来路却不甚干净。",
  },
];

const CARAVAN_EVENTS = [
  {
    id: "bandit",
    title: "山贼窥路",
    stat: "physique",
    danger: 18,
    success: "你带人结阵，喝退山贼",
    fail: "山贼趁夜冲散车队",
    hurt: [5, 14],
    death: "遇山贼劫镖",
    deathRisk: 0.025,
  },
  {
    id: "weather",
    title: "暴雨泥道",
    stat: "knowledge",
    danger: 12,
    success: "你绕过塌方旧道，车马未损",
    fail: "雨路泥泞，货车陷在沟边",
    hurt: [2, 8],
    death: "暴雨山路失足",
    deathRisk: 0.008,
  },
  {
    id: "checkpoint",
    title: "关卡盘查",
    stat: "eq",
    danger: 10,
    success: "你打点文书，顺利过关",
    fail: "关卡盘问许久，误了交货时辰",
    hurt: [0, 3],
    death: "关卡冲突",
    deathRisk: 0.002,
  },
  {
    id: "merchant",
    title: "货主反悔",
    stat: "eq",
    danger: 14,
    success: "你据理争价，保住镖银",
    fail: "货主借故压价，镖银折去一截",
    hurt: [0, 4],
    death: "卷入货主仇杀",
    deathRisk: 0.006,
  },
  {
    id: "inn",
    title: "野店消息",
    stat: "knowledge",
    danger: 8,
    success: "你听出路上风声，提前避险",
    fail: "你误信野店闲话，绕了冤枉路",
    hurt: [0, 5],
    death: "误入险路",
    deathRisk: 0.006,
  },
];

const PROPERTY_CATALOG = [
  { name: "薄田三亩", price: 180, income: 12, icon: "Agriculture", desc: "岁末可得些许租谷，胜在稳当。" },
  { name: "水田一顷", price: 260, income: 20, icon: "PaddyField", desc: "近渠有水，丰年收租更可观。" },
  { name: "竹篱小院", price: 300, income: 17, icon: "BambooHouse", desc: "院小清静，租给读书人正合适。" },
  { name: "城南小屋", price: 320, income: 18, icon: "ClayTileHouse", desc: "遮风避雨，也算安身之处。" },
  { name: "后街小院", price: 460, income: 28, icon: "Backyard", desc: "带一方后院，可住人也可堆货。" },
  { name: "临街铺面", price: 620, income: 42, icon: "BuyShop", desc: "若经营得法，银钱往来颇勤。" },
  { name: "杂货铺", price: 720, income: 48, icon: "GroceryStore", desc: "针头线脑日日有人买，胜在流水稳。" },
  { name: "药田", price: 760, income: 50, icon: "MedicineKingValley", desc: "种植药草，医馆常来收购。" },
  { name: "书铺半间", price: 880, income: 56, icon: "BookStore", desc: "书卷纸墨虽慢热，却能结识士子。" },
  { name: "车马铺", price: 980, income: 64, icon: "CarShop", desc: "修车换马，商旅往来时生意最好。" },
  { name: "县中宅院", price: 1200, income: 75, icon: "CourtyardDwellings", desc: "门第体面，亲友来往也更方便。" },
  { name: "当铺柜面", price: 1500, income: 96, icon: "Pawnshop", desc: "典当周转，利润厚些，风声也杂。" },
  { name: "四合院", price: 2200, income: 132, icon: "Courtyard", desc: "前后成院，足以撑起一户体面门楣。" },
  { name: "城东土楼", price: 3200, income: 178, icon: "EarthBuilding", desc: "屋宇阔大，可分租多户，修缮也费钱。" },
  { name: "望族大宅", price: 5200, income: 260, icon: "RoundDragonHouse", desc: "高门大院，既能收租，也添家族声望。" },
];

const TRAVEL_DESTINATIONS = [
  { name: "清平县", cost: 8, note: "县中街巷熟门熟路。", stat: "mood" },
  { name: "云州", cost: 35, note: "商旅云集，消息灵通。", stat: "eq" },
  { name: "洛城", cost: 55, note: "书院林立，适合访学。", stat: "knowledge" },
  { name: "江陵", cost: 45, note: "水路繁华，适合会友。", stat: "relationship" },
  { name: "梁都", cost: 80, note: "京畿气象，见闻最广。", stat: "virtue" },
];

const SHOP_GOODS = [
  { name: "启蒙书", price: 60, icon: "Book1", stat: "knowledge", value: 4, note: "纸墨浅薄，却能开蒙。" },
  { name: "竹笛", price: 90, icon: "BambooFlute", stat: "mood", value: 5, note: "闲来一曲，心气舒展。" },
  { name: "药囊", price: 120, icon: "MedicineBag", stat: "physique", value: 5, note: "常备药材，可护身。" },
  { name: "玉佩", price: 220, icon: "JadeCraftsman", stat: "looks", value: 4, note: "佩在腰间，颇添风仪。" },
  { name: "礼帖", price: 160, icon: "MainBook", stat: "relationship", value: 6, note: "走动人情少不了。" },
];

const BLACK_MARKET_GOODS = [
  { name: "无名丹", price: 260, icon: "Elixir", stat: "physique", value: 12, risk: "mood", note: "来路不明，效力也不稳。" },
  { name: "旧科题", price: 380, icon: "Book6", stat: "knowledge", value: 10, risk: "virtue", note: "据说是旧年考题手抄本。" },
  { name: "赝造荐书", price: 520, icon: "MainBook", stat: "eq", value: 12, risk: "virtue", note: "能开门路，也会折损名声。" },
  { name: "怪虫谱", price: 300, icon: "Cricket", stat: "cricket", value: 1, risk: "money", note: "记了些捕促织的偏方。" },
];

const MARKET_STALLS = [
  {
    id: "store",
    label: "杂货铺",
    source: "StoreDatabase",
    icon: "BookStore",
    goods: [
      ...SHOP_GOODS,
      { name: "笔墨包", price: 140, icon: "Book2", stat: "knowledge", value: 6, note: "临帖作文都少不了。" },
      { name: "香囊", price: 110, icon: "Jade", stat: "looks", value: 3, note: "衣袖生香，也算体面。" },
    ],
  },
  {
    id: "pharmacy",
    label: "药铺",
    source: "PharmacyDatabase",
    icon: "MedicineBag",
    goods: [
      { name: "参苓丸", price: 180, icon: "MedicineBag", stat: "physique", value: 8, note: "补气养身，久病者尤宜。" },
      { name: "清心散", price: 130, icon: "MedicineBag", stat: "mood", value: 8, note: "清热安神，心绪烦乱时可用。" },
      { name: "跌打酒", price: 95, icon: "Wine1", stat: "physique", value: 5, note: "筋骨损伤常备。" },
      { name: "安神汤", price: 150, icon: "MedicineBag", stat: "mood", value: 10, note: "夜不安眠时最有用。" },
    ],
  },
  {
    id: "inn",
    label: "客栈",
    source: "InnDatabase",
    icon: "Restaurant",
    goods: [
      { name: "热汤饭", price: 45, icon: "Restaurant", stat: "mood", value: 4, note: "一顿热食，最能慰风尘。" },
      { name: "上房一宿", price: 120, icon: "Inn", stat: "physique", value: 6, note: "歇足一夜，精神自复。" },
      { name: "路引消息", price: 85, icon: "MainBook", stat: "eq", value: 4, note: "行商脚夫最知各地风声。" },
      { name: "花雕酒", price: 70, icon: "Wine1", stat: "mood", value: 5, note: "微醺即可，莫要贪杯。" },
    ],
  },
  {
    id: "pleasure",
    label: "风月铺",
    source: "WhorehouseDatabase",
    icon: "Whorehouse",
    goods: [
      { name: "脂粉盒", price: 180, icon: "FemaleSkill", stat: "looks", value: 6, note: "妆点颜色，亦是人情场面。" },
      { name: "曲谱残页", price: 220, icon: "BambooFlute", stat: "eq", value: 6, note: "花间曲调，听来也长见识。" },
    ],
  },
];

const INVENTORY_CAPACITY_BASE = 5;
const INVENTORY_CATEGORIES = [
  ["all", "全部"],
  ["book", "书籍"],
  ["medicine", "丹药"],
  ["equipment", "装备"],
  ["curio", "奇物"],
  ["misc", "杂物"],
];

const ITEM_EFFECTS = {
  布老虎: { icon: "BambooHorse", sell: 8, stat: "mood", value: 2, note: "旧日玩物，摸在手里仍有几分暖意。" },
  家书: { icon: "SendLetter", sell: 0, stat: "relationship", value: 2, note: "翻看家书，想起亲人叮嘱。" },
  小布包: { icon: "Backpack", sell: 18, stat: "mood", value: 3, note: "亲人缝制的小包，能装下几件珍重之物。" },
};

const ANNUAL_GIFTS = [
  { name: "小布包", icon: "Backpack", note: "亲手缝制的小布包" },
  { name: "启蒙书", icon: "Book1", note: "翻旧的启蒙书" },
  { name: "竹笛", icon: "BambooFlute", note: "一支竹笛" },
  { name: "香囊", icon: "Jade", note: "贴身香囊" },
  { name: "安神汤", icon: "MedicineBag", note: "一剂安神汤" },
];

const RELATION_ACTIONS = {
  visit: { label: "探望", cost: 0, relationship: [1, 4], affection: [3, 8], mood: [1, 4], icon: "FamilyIcon" },
  gift: { label: "送礼", cost: 120, relationship: [2, 6], affection: [8, 16], mood: [0, 3], icon: "Jade" },
  borrow: { label: "借钱", cost: 0, relationship: [-6, -2], affection: [-10, -3], money: [80, 220], icon: "CashBox" },
  care: { label: "照料", cost: 60, relationship: [2, 6], affection: [6, 14], physique: [1, 4], icon: "MedicineBag" },
};

const FEMALE_SKILLS = [
  { name: "女红", icon: "FemaleSkill", stat: "eq", value: 4, note: "针线细密，亦练耐心。" },
  { name: "琴艺", icon: "BambooFlute", stat: "mood", value: 4, note: "拨弦成调，心绪自平。" },
  { name: "诗书", icon: "Book", stat: "knowledge", value: 5, note: "闺中读书，也可养才情。" },
  { name: "礼仪", icon: "MainBook", stat: "virtue", value: 4, note: "进退有度，人情更顺。" },
];

const CRICKET_NAMES = ["青麻头", "铁弹子", "金钟儿", "紫背将军", "玉尾郎", "乌头勇士"];
const CHILD_TRAITS = ["聪慧", "活泼", "沉静", "孝顺", "倔强", "早慧", "贪玩", "端方"];
const CHILD_EDU_COST = 80;

const LIFE_PHASES = [
  { max: 5, name: "垂髫", focus: "家宅庇护", tip: "多留意父母亲友，早年心情与体魄最要紧。" },
  { max: 14, name: "启蒙", focus: "读书识字", tip: "去书院温书，15 岁后就能参加童试。" },
  { max: 24, name: "弱冠", focus: "科举营生", tip: "可以谋营生、置办家产，也可准备科举。" },
  { max: 44, name: "立身", focus: "家业声名", tip: "经营事业、亲友与家产，会让后半生更稳。" },
  { max: 64, name: "知命", focus: "子女传承", tip: "照看家人、整理家业，为承继多留余地。" },
  { max: 120, name: "暮年", focus: "命册收束", tip: "保住体魄，人生评分会更看重经历与传承。" },
];

const AGE_MILESTONES = [
  {
    id: "school-age",
    age: 6,
    title: "开蒙",
    text: "你到了开蒙年纪，家中开始商议读书识字之事。",
    effects: { knowledge: [2, 5], mood: [-1, 2] },
    tag: "开蒙",
  },
  {
    id: "academy-age",
    age: 8,
    title: "入学之年",
    text: "你已能入书院听讲，若肯勤读，日后科名便有根基。",
    effects: { knowledge: [3, 6] },
    tag: "入学",
  },
  {
    id: "exam-age",
    age: 15,
    title: "成丁",
    text: "十五岁已可参加童试，也能正式外出营生。",
    effects: { eq: [1, 4], relationship: [1, 4] },
    tag: "可应童试",
  },
  {
    id: "marriage-age",
    age: 16,
    title: "议亲",
    text: "媒人巷里渐有人提起你的名字，姻缘与人情都到了该经营的时候。",
    effects: { relationship: [2, 5] },
  },
  {
    id: "property-age",
    age: 20,
    title: "立业",
    text: "乡里已把你当作能独当一面的大人，置产、经商、科举都成了正路。",
    effects: { eq: [2, 5], money: [30, 90] },
    tag: "立业",
  },
  {
    id: "midlife",
    age: 35,
    title: "中岁",
    text: "奔走半生，人情、家业与名望开始真正压在肩上。",
    effects: { virtue: [1, 5], physique: [-2, 1] },
  },
  {
    id: "elder",
    age: 55,
    title: "知天命",
    text: "你渐知世事不尽如人意，养身与传承比一时得失更重。",
    effects: { virtue: [2, 6], physique: [-4, -1] },
    tag: "知天命",
  },
];

const LIFE_GOALS = [
  { id: "first-career", title: "安身立命", icon: "CashBox", desc: "拥有一份固定营生。", score: 60, done: () => !!state.career, advice: "15 岁后到营生页谋一份差事。" },
  { id: "first-exam", title: "童试入场", icon: "Book", desc: "参加一次正式科举。", score: 50, done: () => state.exam.attempts > 0, advice: "15 岁后去书院参加童试。" },
  { id: "scholar", title: "金榜有名", icon: "MainBook", desc: "取得至少秀才功名。", score: 120, done: () => state.exam.rank >= 0, advice: "提高学识后继续科举。" },
  { id: "jinshi", title: "殿试及第", icon: "Official", desc: "通过殿试成为进士。", score: 260, done: () => hasPalaceAppointment(), advice: "一路通过乡试、会试，再参加殿试。" },
  { id: "career-level", title: "本业精熟", icon: "Craftsman", desc: "任一营生达到 3 级。", score: 120, done: () => Object.values(state.careerProgress || {}).some((item) => Number(item.level) >= 3), advice: "在营生页持续处理本业事务。" },
  { id: "family", title: "成家立室", icon: "FamilyIcon", desc: "成婚或拥有子女。", score: 100, done: () => !!state.family.spouse || livingChildren().length > 0, advice: "16 岁后去媒人处相看，或经营亲友关系。" },
  { id: "landed", title: "置办家产", icon: "House", desc: "拥有至少一处家产。", score: 110, done: () => (state.assets || []).length > 0, advice: "攒够钱后进入家产页置办田宅铺面。" },
  { id: "network", title: "亲友满座", icon: "Relationship1", desc: "亲友记录达到 8 人。", score: 90, done: () => familyRows().length + state.friends.length + livingChildren().length >= 8, advice: "多去会友、酒楼、探亲，扩展人脉。" },
  { id: "healthy", title: "身强体健", icon: "MedicineBag", desc: "体魄达到 85。", score: 80, done: () => state.stats.physique >= 85, advice: "去医馆调理，少碰风险活动。" },
  { id: "renown", title: "一方闻名", icon: "Activity", desc: "名望达到 60。", score: 120, done: () => state.stats.favorability >= 60, advice: "处理官府事务、活动事件或积累善名。" },
];

const ONBOARDING_VERSION = 1;

const SFX = (() => {
  let ctx = null;
  let muted = false;
  const VOLUME = 0.35;
  function getCtx() {
    if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { return null; } }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }
  function osc(c, freq, type, dur, gainEnd) {
    const o = c.createOscillator(); const g = c.createGain();
    o.type = type || "sine"; o.frequency.setValueAtTime(freq, c.currentTime);
    g.gain.setValueAtTime(VOLUME, c.currentTime);
    g.gain.exponentialRampToValueAtTime(gainEnd || 0.001, c.currentTime + dur);
    o.connect(g); g.connect(c.destination); o.start(c.currentTime); o.stop(c.currentTime + dur);
  }
  function noise(c, dur, highpass) {
    const bufSize = Math.floor(c.sampleRate * dur);
    const buf = c.createBuffer(1, bufSize, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
    const src = c.createBufferSource(); src.buffer = buf;
    const gain = c.createGain(); gain.gain.setValueAtTime(VOLUME * 0.5, c.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
    let node = src;
    if (highpass) { const hp = c.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = highpass; src.connect(hp); node = hp; }
    node.connect(gain); gain.connect(c.destination); src.start(c.currentTime); src.stop(c.currentTime + dur);
  }
  function play(name) {
    if (muted) return;
    const c = getCtx(); if (!c) return;
    switch (name) {
      case "click": osc(c, 1200, "sine", 0.06, 0.001); break;
      case "page": noise(c, 0.12, 2000); break;
      case "event": osc(c, 660, "sine", 0.4, 0.001); setTimeout(() => osc(c, 880, "sine", 0.3, 0.001), 80); break;
      case "exam-pass": osc(c, 523, "sine", 0.15, 0.001); setTimeout(() => osc(c, 659, "sine", 0.15, 0.001), 120); setTimeout(() => osc(c, 784, "sine", 0.15, 0.001), 240); setTimeout(() => osc(c, 1047, "sine", 0.35, 0.001), 360); break;
      case "exam-fail": osc(c, 440, "triangle", 0.2, 0.001); setTimeout(() => osc(c, 349, "triangle", 0.25, 0.001), 180); setTimeout(() => osc(c, 262, "triangle", 0.35, 0.001), 360); break;
      case "death": osc(c, 110, "sine", 1.2, 0.001); osc(c, 165, "sine", 1.0, 0.001); break;
      case "coin": osc(c, 1800, "sine", 0.06, 0.001); setTimeout(() => osc(c, 2200, "sine", 0.05, 0.001), 60); break;
      case "win": for (const [f, d] of [[523,0],[659,0.1],[784,0.2],[1047,0.3]]) setTimeout(() => osc(c, f, "sine", 0.12, 0.001), d * 1000); setTimeout(() => { osc(c, 1319, "sine", 0.3, 0.001); }, 400); break;
      case "milestone": for (const [f, d] of [[392,0],[523,0.1],[659,0.2],[784,0.3]]) setTimeout(() => osc(c, f, "triangle", 0.2, 0.001), d * 1000); break;
      case "start": osc(c, 262, "sine", 0.5, 0.001); setTimeout(() => osc(c, 330, "sine", 0.4, 0.001), 200); setTimeout(() => osc(c, 392, "sine", 0.3, 0.001), 400); setTimeout(() => osc(c, 523, "sine", 0.6, 0.001), 600); break;
      case "marry": osc(c, 880, "sine", 0.3, 0.001); setTimeout(() => osc(c, 1047, "sine", 0.3, 0.001), 200); setTimeout(() => osc(c, 880, "sine", 0.3, 0.001), 400); setTimeout(() => osc(c, 1175, "sine", 0.5, 0.001), 600); break;
    }
  }
  function toggleMute() { muted = !muted; return muted; }
  function isMuted() { return muted; }
  document.addEventListener("click", () => { if (!ctx) getCtx(); }, { once: true });
  return { play, toggleMute, isMuted };
})();

let state = loadCurrentSave();
let draft = newDraft();
let view = {
  screen: state ? "game" : "create",
  page: "main",
  tab: "overview",
  activityId: "",
  placeId: "",
  overlay: state && !state.onboarding?.seen ? "onboarding" : "",
};

setAssetVars();

function setAssetVars() {
  document.documentElement.style.setProperty("--scene-bg", cssAsset("Background"));
  document.documentElement.style.setProperty("--paper-bg", cssAsset("GeneralBackground"));
}

function pathFor(name) {
  return PREMIUM_ICON_OVERRIDES[name] || DATA.sprites?.[name] || "";
}

function cssAsset(name) {
  const path = pathFor(name);
  return path ? `url("${path}")` : "none";
}

function icon(name, alt = "") {
  const path = pathFor(name);
  return path ? `<img src="${path}" alt="${escapeHtml(alt)}" loading="lazy">` : "";
}

function sample(list) {
  if (!list || !list.length) return undefined;
  return list[Math.floor(Math.random() * list.length)];
}

function pickMany(list, count) {
  const pool = [...(list || [])];
  const out = [];
  while (pool.length && out.length < count) {
    out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  }
  return out;
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function rangeValue(range) {
  return Array.isArray(range) ? randInt(range[0], range[1]) : Number(range || 0);
}

function applyEffectRanges(effects = {}, deltas = []) {
  for (const [stat, range] of Object.entries(effects || {})) changeStat(stat, rangeValue(range), deltas);
}

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function clampNumber(value, min, max, fallback = min) {
  const next = Number.isFinite(Number(value)) ? Number(value) : fallback;
  return Math.max(min, Math.min(max, Math.round(next)));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function moneyParts(value) {
  const sign = Number(value) < 0 ? -1 : 1;
  let copper = Math.abs(Math.round(Number(value) || 0));
  const gold = Math.floor(copper / COPPER_PER_GOLD);
  copper %= COPPER_PER_GOLD;
  const silver = Math.floor(copper / COPPER_PER_SILVER);
  copper %= COPPER_PER_SILVER;
  return { sign, gold, silver, copper };
}

function moneyText(value, options = {}) {
  const { compact = false, signed = false, zero = "0 铜钱" } = options;
  const parts = moneyParts(value);
  const units = [];
  if (parts.gold) units.push(`${parts.gold}${compact ? "金" : "两黄金"}`);
  if (parts.silver) units.push(`${parts.silver}${compact ? "银" : "两银子"}`);
  if (parts.copper || !units.length) units.push(`${parts.copper}${compact ? "钱" : "铜钱"}`);
  let text = units.length ? units.join(compact ? "" : " ") : zero;
  if (Number(value) === 0 && zero) text = zero;
  if (signed && Number(value) > 0) return `+${text}`;
  if (parts.sign < 0 && text !== zero) return `-${text}`;
  return text;
}

function chineseNumberToInt(text) {
  const digits = { 零: 0, 〇: 0, 一: 1, 二: 2, 两: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 };
  const units = { 十: 10, 百: 100, 千: 1000, 万: 10000 };
  let total = 0;
  let section = 0;
  let number = 0;
  for (const char of String(text || "")) {
    if (Object.prototype.hasOwnProperty.call(digits, char)) {
      number = digits[char];
    } else if (char === "万") {
      section = (section + number) || 1;
      total += section * units[char];
      section = 0;
      number = 0;
    } else if (Object.prototype.hasOwnProperty.call(units, char)) {
      section += (number || 1) * units[char];
      number = 0;
    } else {
      return null;
    }
  }
  return total + section + number;
}

function normalizeMoneyText(value) {
  return String(value ?? "")
    .replace(/(\d+)\s*文钱?/g, (_, amount) => moneyText(Number(amount)))
    .replace(/([零〇一二两三四五六七八九十百千万]+)\s*文钱/g, (match, amount) => {
      const value = chineseNumberToInt(amount);
      return value === null ? match : moneyText(value);
    });
}

function formatText(value) {
  return escapeHtml(normalizeMoneyText(value)).replace(/\n/g, "<br>");
}

function newDraft(genderOverride) {
  const names = DATA.database?.names || {};
  const gender = genderOverride === "female" ? "female" : "male";
  return {
    gender,
    family: sample(names.last) || "李",
    given: sample(gender === "female" ? names.female : names.male) || (gender === "female" ? "婉儿" : "青云"),
    difficulty: "普通",
    talents: pickMany(DATA.database?.talents || [], 3),
    coreTalent: sample(DATA.database?.coreTalents || []),
  };
}

function rerollDraft() {
  draft.talents = pickMany(DATA.database?.talents || [], 3);
  draft.coreTalent = sample(DATA.database?.coreTalents || []);
  render();
}

function randomName() {
  const names = DATA.database?.names || {};
  draft.family = sample(names.last) || draft.family;
  draft.given = sample(draft.gender === "female" ? names.female : names.male) || draft.given;
  render();
}

function avatarOptions(gender = state?.gender || "male") {
  return PLAYER_AVATARS[gender === "female" ? "female" : "male"] || PLAYER_AVATARS.male;
}

function defaultProfileAvatar(gender = state?.gender || "male") {
  return avatarOptions(gender)[0] || "";
}

function createFamily(familyName) {
  return {
    father: { name: `${familyName}${sample(DATA.database?.names?.male) || "父"}`, relation: "父亲", gender: "male", alive: true, age: randInt(28, 42), physique: randInt(58, 88), affection: randInt(72, 96) },
    mother: { name: `${sample(DATA.database?.names?.last) || "王"}${sample(DATA.database?.names?.female) || "氏"}`, relation: "母亲", gender: "female", alive: true, age: randInt(25, 39), physique: randInt(55, 86), affection: randInt(72, 96) },
    siblings: makeSiblings(familyName),
    lover: false,
    children: [],
  };
}

function makeSiblings(familyName, count = randInt(0, 2)) {
  return Array.from({ length: count }, () => {
    const gender = Math.random() > 0.5 ? "male" : "female";
    const age = randInt(2, 12);
    return {
      name: `${familyName}${sample(gender === "female" ? DATA.database?.names?.female : DATA.database?.names?.male) || "无名"}`,
      relation: gender === "female" ? "姐姐" : "哥哥",
      gender,
      age,
      physique: randInt(45, 88),
      alive: true,
      affection: randInt(42, 88),
    };
  });
}

function openingBiography(familyName, given, playerGender) {
  const day = sample(["七曜年", "春分日", "谷雨时", "桂月夜", "小雪晨"]) || "七曜年";
  const place = sample(["青省昆北府", "云州清平县", "洛城南里", "江陵水驿", "梁都外郭"]) || "清平县";
  const father = sample(["博文", "务农", "行商", "以抄书为业", "在县中当差"]) || "务农";
  const mother = sample(["温婉", "爽利", "善织", "闻名邻里", "以都讲为业"]) || "温婉";
  const hasSibling = Math.random() > 0.42;
  let sibling = "家中暂未添兄姐。";
  if (hasSibling) {
    const siblingGender = Math.random() > 0.5 ? "male" : "female";
    const siblingRelation = siblingGender === "male" ? "哥哥" : "姐姐";
    const siblingName = sample(DATA.database?.names?.[siblingGender === "female" ? "female" : "male"]) || (siblingGender === "female" ? "飞凰" : "承安");
    sibling = `有${siblingRelation}${familyName}${siblingName}，正值垂髫之年。`;
  }
  return `${day}，我生于${place}，随父姓${familyName}，名${given}。父亲${familyName}${father}，年三十，以勤谨持家。母亲${sample(DATA.database?.names?.last) || "王"}氏，${mother}，年二十九，邻里多称其贤。${sibling}`;
}

function startLife() {
  const biography = openingBiography(draft.family, draft.given, draft.gender);
  const stats = {
    mood: randInt(56, 82),
    physique: randInt(38, 68),
    looks: randInt(32, 72),
    eq: randInt(30, 66),
    knowledge: randInt(28, 64),
    virtue: randInt(34, 70),
    relationship: randInt(12, 35),
    favorability: randInt(0, 8),
    money: draft.difficulty === "富贵" ? randInt(360, 900) : draft.difficulty === "寒门" ? randInt(8, 45) : randInt(50, 170),
  };

  applyOpeningTalents(stats, draft.talents, draft.coreTalent);
  SFX.play("start");

  state = normalizeState({
    name: `${draft.family}${draft.given}`,
    gender: draft.gender,
    profileAvatar: defaultProfileAvatar(draft.gender),
    difficulty: draft.difficulty,
    age: 0,
    year: 0,
    location: "清平县",
    stats,
    talents: draft.talents,
    coreTalent: draft.coreTalent,
    career: null,
    careerProgress: {},
    friends: [],
    tags: [],
    diseases: [],
    inventory: ["布老虎", "家书"],
    log: [{ age: 0, title: "降生", text: biography }],
    biography,
    assets: [],
    ledger: [{ age: 0, title: "压岁钱", amount: Math.round(stats.money), text: "长辈添了些开蒙用的钱。" }],
    crickets: [],
    cricketRecord: { wins: 0, losses: 0, champion: 0 },
    femaleSkills: {},
    official: { rank: 0, merit: 0 },
    lineage: { generation: 1, familyName: draft.family, ancestors: [] },
    life: { milestones: [], goals: [] },
    study: { prep: 0, lastYear: -1 },
    gamble: createGambleRound(50),
    miniGames: createMiniGamesState(),
    courtesanContest: null,
    market: { year: -1, factor: 1 },
    caravanMemory: {},
    pendingCaravan: null,
    family: createFamily(draft.family),
    exam: { rank: -1, attempts: 0, history: [], current: null, lastYear: -1 },
    pendingActivity: null,
    eventResult: null,
    pendingSurprise: null,
    currentEvent: null,
    inventoryTab: "all",
    onboarding: { version: ONBOARDING_VERSION, seen: false },
    lastDeltas: [],
    dead: false,
    deathReason: "",
    prisonYears: 0,
  });
  view.screen = "game";
  view.page = "main";
  view.tab = "overview";
  view.activityId = "";
  view.placeId = "";
  view.overlay = "onboarding";
  const meta = loadSlotMeta();
  currentSlot = firstEmptySlot(meta);
  state.saveSlot = currentSlot;
  save();
  render();
}

function applyOpeningTalents(stats, talents, coreTalent) {
  const text = `${talents.map((item) => item.desc || "").join("\n")}\n${coreTalent?.desc || ""}`;
  if (/体魄|狩猎|武/.test(text)) stats.physique += 8;
  if (/学识|读书|感悟|才/.test(text)) stats.knowledge += 8;
  if (/容貌|姿色|貌/.test(text)) stats.looks += 8;
  if (/处世|人意|交/.test(text)) stats.eq += 8;
  if (/德|善|仁/.test(text)) stats.virtue += 8;
  if (/财|钱|薪水|富/.test(text)) stats.money += 80;
  for (const key of Object.keys(stats)) {
    if (key !== "money") stats[key] = clamp(stats[key]);
  }
}

function normalizeState(raw) {
  const next = raw || {};
  next.name ||= "李青云";
  next.gender = next.gender === "female" ? "female" : "male";
  next.profileAvatar = avatarOptions(next.gender).includes(next.profileAvatar) ? next.profileAvatar : defaultProfileAvatar(next.gender);
  next.difficulty ||= "普通";
  next.age = Number.isFinite(Number(next.age)) ? Number(next.age) : 1;
  next.year = Number.isFinite(Number(next.year)) ? Number(next.year) : next.age;
  next.location ||= "清平县";
  next.stats = next.stats || {};
  for (const key of [...Object.keys(STAT_LABELS), "relationship", "favorability", "money"]) {
    next.stats[key] = Number.isFinite(Number(next.stats[key])) ? Number(next.stats[key]) : key === "money" ? 60 : 50;
    if (key !== "money") next.stats[key] = clamp(next.stats[key]);
  }
  next.talents = Array.isArray(next.talents) ? next.talents : [];
  next.coreTalent = next.coreTalent || null;
  next.career = next.career || null;
  next.friends = Array.isArray(next.friends) ? next.friends.map(normalizeFriend) : [];
  next.tags = Array.isArray(next.tags) ? next.tags : [];
  next.diseases = Array.isArray(next.diseases) ? next.diseases : [];
  next.inventory = Array.isArray(next.inventory) ? next.inventory : [];
  next.log = Array.isArray(next.log) ? next.log : [];
  next.biography ||= next.log.find((item) => item.title === "降生")?.text || `${next.name}生于${next.location}。`;
  next.assets = Array.isArray(next.assets) ? next.assets : [];
  next.ledger = Array.isArray(next.ledger) ? next.ledger : [];
  next.crickets = Array.isArray(next.crickets) ? next.crickets.map(normalizeCricket).filter((item) => item && item.alive !== false) : [];
  next.cricketRecord = next.cricketRecord && typeof next.cricketRecord === "object" ? next.cricketRecord : { wins: 0, losses: 0, champion: 0 };
  next.cricketRecord.wins = Math.max(0, Number(next.cricketRecord.wins) || 0);
  next.cricketRecord.losses = Math.max(0, Number(next.cricketRecord.losses) || 0);
  next.cricketRecord.champion = Math.max(0, Number(next.cricketRecord.champion) || 0);
  next.femaleSkills = next.femaleSkills && typeof next.femaleSkills === "object" ? next.femaleSkills : {};
  next.official = next.official && typeof next.official === "object" ? next.official : { rank: 0, merit: 0 };
  next.official.rank = clamp(Math.round(Number(next.official.rank) || 0), 0, OFFICIAL_RANKS.length - 1);
  next.official.merit = Math.max(0, Number(next.official.merit) || 0);
  next.official.unlocked = !!next.official.unlocked;
  next.lineage = normalizeLineage(next.lineage, next.name.slice(0, 1));
  next.life = normalizeLife(next.life, next.age);
  next.study = normalizeStudy(next.study);
  next.gamble = normalizeGamble(next.gamble);
  next.miniGames = normalizeMiniGames(next.miniGames);
  next.courtesanContest = normalizeCourtesanContest(next.courtesanContest);
  next.careerProgress = next.careerProgress && typeof next.careerProgress === "object" ? next.careerProgress : {};
  next.market = next.market && typeof next.market === "object" ? next.market : {};
  next.market.year = Number.isFinite(Number(next.market.year)) ? Number(next.market.year) : -1;
  next.market.factor = Number.isFinite(Number(next.market.factor)) ? Number(next.market.factor) : 1;
  next.caravanMemory = normalizeCaravanMemory(next.caravanMemory);
  next.pendingCaravan = normalizeCaravanRun(next.pendingCaravan, next.age);
  next.family = normalizeFamily(next.family, next.name.slice(0, 1));
  next.exam = normalizeExam(next.exam);
  next.pendingActivity = next.pendingActivity || null;
  next.eventResult = next.eventResult || null;
  next.pendingSurprise = next.pendingSurprise || null;
  next.inventoryTab = INVENTORY_CATEGORIES.some(([id]) => id === next.inventoryTab) ? next.inventoryTab : "all";
  next.onboarding = normalizeOnboarding(next.onboarding);
  next.lastDeltas = Array.isArray(next.lastDeltas) ? next.lastDeltas : [];
  next.prisonYears = Math.max(0, Math.round(Number(next.prisonYears) || 0));
  next.dead = !!next.dead;
  next.deathReason ||= "";
  if (next.dead) {
    next.currentEvent = null;
    next.pendingCaravan = null;
  }
  return next;
}

function normalizeOnboarding(onboarding) {
  const source = onboarding && typeof onboarding === "object" ? onboarding : {};
  const version = Math.max(0, Math.round(Number(source.version) || 0));
  return {
    version,
    seen: !!source.seen && version >= ONBOARDING_VERSION,
  };
}

function normalizeFamily(family, familyName) {
  const source = family || {};
  const father =
    source.father && typeof source.father === "object"
      ? source.father
      : { name: `${familyName}${sample(DATA.database?.names?.male) || "父"}`, relation: "父亲", gender: "male", alive: source.father !== false, age: randInt(28, 42), physique: randInt(58, 88) };
  const mother =
    source.mother && typeof source.mother === "object"
      ? source.mother
      : { name: `${sample(DATA.database?.names?.last) || "王"}${sample(DATA.database?.names?.female) || "氏"}`, relation: "母亲", gender: "female", alive: source.mother !== false, age: randInt(25, 39), physique: randInt(55, 86) };
  let siblings = source.siblings;
  if (typeof siblings === "number") siblings = makeSiblings(familyName, Math.max(0, Math.min(4, siblings)));
  if (!Array.isArray(siblings)) siblings = [];
  let children = source.children;
  if (typeof children === "number") {
    children = Array.from({ length: Math.max(0, Math.min(8, Math.round(children))) }, () => makeChild(familyName, randInt(0, 12)));
  }
  if (!Array.isArray(children)) children = [];
  return {
    father: normalizeParent({ relation: "父亲", gender: "male", alive: true, affection: randInt(68, 96), ...father }, "father"),
    mother: normalizeParent({ relation: "母亲", gender: "female", alive: true, affection: randInt(68, 96), ...mother }, "mother"),
    siblings: siblings.map((item) => normalizeRelative({ relation: item.gender === "female" ? "姐姐" : "哥哥", alive: true, affection: randInt(42, 88), ...item }, familyName, "sibling")),
    lover: source.lover || false,
    loverMeta: source.lover ? normalizeRelative({ name: typeof source.lover === "string" ? source.lover : source.lover?.name, relation: "相看之人", gender: source.loverGender, alive: true, affection: 64, ...source.loverMeta }, familyName, "partner") : null,
    spouse: source.spouse || null,
    spouseMeta: source.spouse ? normalizeRelative({ name: typeof source.spouse === "string" ? source.spouse : source.spouse?.name, relation: "配偶", gender: source.spouseGender, alive: true, affection: source.spouseAffection ?? 78, ...source.spouseMeta }, familyName, "partner") : null,
    spouseAffection: clamp(Number(source.spouseAffection ?? 78)),
    children: children.map((item) => normalizeChild(item, familyName)),
  };
}

function normalizeRelative(person, familyName = "李", kind = "friend") {
  const source = person && typeof person === "object" ? person : {};
  const gender = source.gender === "female" || source.relation === "姐姐" || source.relation === "妹妹" ? "female" : source.gender === "male" || source.relation === "哥哥" || source.relation === "弟弟" ? "male" : Math.random() > 0.5 ? "male" : "female";
  const relation = source.relation || (kind === "partner" ? "亲友" : kind === "sibling" ? (gender === "female" ? "姐姐" : "哥哥") : "友人");
  const fallbackName = kind === "sibling"
    ? `${familyName}${sample(gender === "female" ? DATA.database?.names?.female : DATA.database?.names?.male) || "无名"}`
    : makePersonName(gender);
  const ageFallback = kind === "partner" ? randInt(16, 32) : kind === "sibling" ? randInt(2, 16) : randInt(12, 60);
  const physiqueFallback = kind === "partner" ? randInt(48, 86) : kind === "sibling" ? randInt(42, 88) : randInt(35, 88);
  const age = Math.max(0, Math.round(Number(source.age) || ageFallback));
  const physique = clamp(Number(source.physique ?? physiqueFallback));
  return {
    ...source,
    id: source.id || `${kind}-${source.name || fallbackName}`,
    name: source.name || fallbackName,
    relation,
    gender,
    age,
    physique,
    alive: source.alive !== false && physique > 0,
    affection: clamp(Number(source.affection ?? randInt(42, 78))),
  };
}

function normalizeParent(parent, role) {
  const source = parent && typeof parent === "object" ? parent : {};
  const isFather = role === "father" || source.gender === "male";
  const ageFallback = isFather ? randInt(28, 42) : randInt(25, 39);
  const physiqueFallback = isFather ? randInt(58, 88) : randInt(55, 86);
  const age = Math.max(18, Math.round(Number(source.age) || ageFallback));
  const physique = clamp(Number(source.physique ?? physiqueFallback));
  return {
    ...source,
    relation: isFather ? "父亲" : "母亲",
    gender: isFather ? "male" : "female",
    age,
    physique,
    alive: source.alive !== false && physique > 0,
    affection: clamp(Number(source.affection ?? randInt(68, 96))),
  };
}

function makeChild(familyName = state?.name?.slice(0, 1) || "李", age = 0) {
  const gender = Math.random() > 0.5 ? "male" : "female";
  return {
    id: `child-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: `${familyName}${sample(gender === "female" ? DATA.database?.names?.female : DATA.database?.names?.male) || "承安"}`,
    relation: gender === "female" ? "女儿" : "儿子",
    gender,
    age,
    alive: true,
    physique: randInt(42, 86),
    affection: randInt(62, 92),
    aptitude: randInt(35, 88),
    study: randInt(0, 20),
    virtue: randInt(30, 80),
    trait: sample(CHILD_TRAITS) || "聪慧",
  };
}

function normalizeChild(child, familyName) {
  const base = child && typeof child === "object" ? child : makeChild(familyName);
  const gender = base.gender === "female" ? "female" : "male";
  const physique = clamp(Number(base.physique ?? randInt(42, 86)));
  return {
    id: base.id || `child-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: base.name || `${familyName}${sample(gender === "female" ? DATA.database?.names?.female : DATA.database?.names?.male) || "承安"}`,
    relation: base.relation || (gender === "female" ? "女儿" : "儿子"),
    gender,
    age: Math.max(0, Math.round(Number(base.age) || 0)),
    physique,
    alive: base.alive !== false && physique > 0,
    affection: clamp(Number(base.affection ?? 70)),
    aptitude: clamp(Number(base.aptitude ?? 55)),
    study: clamp(Number(base.study ?? 0)),
    virtue: clamp(Number(base.virtue ?? 50)),
    trait: base.trait || sample(CHILD_TRAITS) || "聪慧",
  };
}

function normalizeFriend(friend) {
  if (typeof friend === "string") {
    return { id: `friend-${friend}`, name: friend, relation: "友人", gender: "unknown", age: randInt(12, 60), physique: randInt(35, 88), alive: true, affection: randInt(42, 78), lastMet: -1 };
  }
  const source = friend && typeof friend === "object" ? friend : {};
  const name = source.name || makePersonName(Math.random() > 0.5 ? "male" : "female");
  const relative = normalizeRelative({ ...source, name, relation: source.relation || "友人" }, "李", "friend");
  return {
    ...relative,
    id: source.id || `friend-${name}`,
    lastMet: Number.isFinite(Number(source.lastMet)) ? Number(source.lastMet) : -1,
    debt: Math.max(0, Number(source.debt) || 0),
  };
}

function courtesanEntranceCost() {
  const money = Number(state?.stats?.money || 0);
  return clampNumber(Math.round(money * 0.018), 80, 900, 120);
}

function courtesanGiftCost() {
  const money = Number(state?.stats?.money || 0);
  return clampNumber(Math.round(money * 0.012), 50, 600, 80);
}

function createCourtesanCandidate(index = 0) {
  const specialty = sample(COURTESAN_SPECIALTIES) || COURTESAN_SPECIALTIES[0];
  return normalizeCourtesanCandidate({
    id: `courtesan-${Date.now()}-${index}-${Math.random().toString(16).slice(2)}`,
    name: makePersonName("female"),
    age: randInt(18, 28),
    specialty: specialty.name,
    icon: specialty.icon,
    portrait: COURTESAN_PORTRAITS[index % COURTESAN_PORTRAITS.length],
    specialtyText: specialty.text,
    background: sample(COURTESAN_BACKGROUNDS),
    talent: randInt(42, 95),
    wit: randInt(36, 92),
    virtue: randInt(28, 88),
    looks: randInt(48, 96),
    support: randInt(4, 18),
    affection: randInt(42, 66),
    score: 0,
    roundScores: [],
  }, index);
}

function normalizeCourtesanCandidate(candidate, index = 0) {
  const source = candidate && typeof candidate === "object" ? candidate : {};
  const specialty = COURTESAN_SPECIALTIES.find((item) => item.name === source.specialty) || sample(COURTESAN_SPECIALTIES) || COURTESAN_SPECIALTIES[0];
  return {
    id: source.id || `courtesan-${index}-${Math.random().toString(16).slice(2)}`,
    name: source.name || makePersonName("female"),
    age: clampNumber(source.age, 18, 36, randInt(18, 28)),
    specialty: source.specialty || specialty.name,
    icon: source.icon || specialty.icon,
    portrait: source.portrait || COURTESAN_PORTRAITS[index % COURTESAN_PORTRAITS.length],
    specialtyText: source.specialtyText || specialty.text,
    background: source.background || sample(COURTESAN_BACKGROUNDS) || "身世不详，却以一门才艺立足瓦舍。",
    talent: clampNumber(source.talent, 0, 100, randInt(42, 95)),
    wit: clampNumber(source.wit, 0, 100, randInt(36, 92)),
    virtue: clampNumber(source.virtue, 0, 100, randInt(28, 88)),
    looks: clampNumber(source.looks, 0, 100, randInt(48, 96)),
    support: clampNumber(source.support, 0, 100, randInt(4, 18)),
    affection: clampNumber(source.affection, 0, 100, randInt(42, 66)),
    score: Math.max(0, Math.round(Number(source.score) || 0)),
    roundScores: Array.isArray(source.roundScores) ? source.roundScores.slice(0, COURTESAN_ROUNDS.length) : [],
  };
}

function createCourtesanContest() {
  const count = randInt(3, 5);
  return normalizeCourtesanContest({
    id: `contest-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    round: 0,
    entranceCost: courtesanEntranceCost(),
    giftCost: courtesanGiftCost(),
    startedYear: Number(state?.year ?? state?.age ?? 0),
    candidates: Array.from({ length: count }, (_, index) => createCourtesanCandidate(index)),
    log: ["今日后楼设局评选佳丽，诸客入席，花笺在案，灯影照人。"],
  });
}

function normalizeCourtesanContest(contest) {
  if (!contest || typeof contest !== "object" || !Array.isArray(contest.candidates)) return null;
  const candidates = contest.candidates.map(normalizeCourtesanCandidate).filter(Boolean).slice(0, 6);
  if (!candidates.length) return null;
  return {
    id: contest.id || `contest-${Date.now()}`,
    round: clampNumber(contest.round, 0, COURTESAN_ROUNDS.length, 0),
    entranceCost: Math.max(0, Math.round(Number(contest.entranceCost) || 120)),
    giftCost: Math.max(0, Math.round(Number(contest.giftCost) || 80)),
    startedYear: Number.isFinite(Number(contest.startedYear)) ? Number(contest.startedYear) : 0,
    candidates,
    log: Array.isArray(contest.log) ? contest.log.slice(-8) : [],
  };
}

function normalizeLineage(lineage, familyName) {
  const source = lineage && typeof lineage === "object" ? lineage : {};
  return {
    generation: Math.max(1, Math.round(Number(source.generation) || 1)),
    familyName: source.familyName || familyName,
    ancestors: Array.isArray(source.ancestors) ? source.ancestors.slice(0, 12) : [],
  };
}

function normalizeCricket(cricket) {
  const source = cricket && typeof cricket === "object" ? cricket : null;
  if (!source) return null;
  const quality = clamp(Number(source.quality ?? randInt(18, 92)));
  const age = Math.max(0, Math.round(Number(source.age) || 0));
  const lifespan = Math.max(6, Math.min(10, Math.round(Number(source.lifespan) || randInt(6, 10))));
  return {
    id: source.id || `cricket-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: source.name || sample(CRICKET_NAMES) || "青麻头",
    quality,
    age,
    lifespan,
    wins: Math.max(0, Math.round(Number(source.wins) || 0)),
    alive: source.alive !== false && age < lifespan,
    icon: source.icon || "Cricket",
  };
}

function normalizeExam(exam) {
  const source = exam || {};
  const current = source.current || null;
  const removedCurrent =
    current &&
    (REMOVED_EXAM_TYPES.includes(current.extraType) ||
      (Array.isArray(current.questions) && current.questions.some((question) => /英文|English|拼写/i.test(question?.content || ""))));
  return {
    rank: Number.isFinite(Number(source.rank)) ? Number(source.rank) : -1,
    attempts: Math.max(0, Number(source.attempts) || 0),
    history: Array.isArray(source.history) ? source.history : [],
    current: removedCurrent ? null : current,
    lastYear: Number.isFinite(Number(source.lastYear)) ? Number(source.lastYear) : -1,
  };
}

function normalizeLife(life, age = -1) {
  const source = life && typeof life === "object" ? life : {};
  const reached = AGE_MILESTONES.filter((item) => Number(age) >= item.age).map((item) => item.id);
  return {
    milestones: [...new Set([...(Array.isArray(source.milestones) ? source.milestones : []), ...reached])],
    goals: Array.isArray(source.goals) ? source.goals : [],
  };
}

function normalizeStudy(study) {
  const source = study && typeof study === "object" ? study : {};
  return {
    prep: clamp(Number(source.prep) || 0),
    lastYear: Number.isFinite(Number(source.lastYear)) ? Number(source.lastYear) : -1,
  };
}

function createMiniGamesState() {
  return {
    tab: "gomoku",
    record: { gomokuWins: 0, gomokuLosses: 0, gomokuDraws: 0, touhuBest: 0, xiangqiWins: 0, xiangqiLosses: 0 },
    gomoku: createGomokuGame(),
    touhu: createTouhuGame(),
    xiangqi: createXiangqiGame(),
  };
}

function normalizeMiniGames(miniGames) {
  const source = miniGames && typeof miniGames === "object" ? miniGames : {};
  const record = source.record && typeof source.record === "object" ? source.record : {};
  return {
    tab: MINI_GAME_TABS.some(([id]) => id === source.tab) ? source.tab : "gomoku",
    record: {
      gomokuWins: Math.max(0, Math.round(Number(record.gomokuWins) || 0)),
      gomokuLosses: Math.max(0, Math.round(Number(record.gomokuLosses) || 0)),
      gomokuDraws: Math.max(0, Math.round(Number(record.gomokuDraws) || 0)),
      touhuBest: Math.max(0, Math.round(Number(record.touhuBest) || 0)),
      xiangqiWins: Math.max(0, Math.round(Number(record.xiangqiWins) || 0)),
      xiangqiLosses: Math.max(0, Math.round(Number(record.xiangqiLosses) || 0)),
    },
    gomoku: normalizeGomokuGame(source.gomoku),
    touhu: normalizeTouhuGame(source.touhu),
    xiangqi: normalizeXiangqiGame(source.xiangqi),
  };
}

function createGomokuGame() {
  return {
    board: Array(GOMOKU_SIZE * GOMOKU_SIZE).fill(0),
    winner: "",
    lastMove: -1,
    moves: [],
    message: "执黑先行，在棋盘上连成五子即可取胜。",
  };
}

function normalizeGomokuGame(game) {
  const source = game && typeof game === "object" ? game : {};
  const board = Array.isArray(source.board) ? source.board.slice(0, GOMOKU_SIZE * GOMOKU_SIZE) : [];
  while (board.length < GOMOKU_SIZE * GOMOKU_SIZE) board.push(0);
  return {
    board: board.map((cell) => (Number(cell) === 2 ? 2 : Number(cell) === 1 ? 1 : 0)),
    winner: ["player", "opponent", "draw"].includes(source.winner) ? source.winner : "",
    lastMove: Number.isFinite(Number(source.lastMove)) ? Number(source.lastMove) : -1,
    moves: Array.isArray(source.moves) ? source.moves.slice(-80) : [],
    message: source.message || "执黑先行，在棋盘上连成五子即可取胜。",
  };
}

function createTouhuGame() {
  return {
    aim: 50,
    strength: 58,
    wind: randInt(-16, 16),
    arrowsLeft: TOUHU_ARROW_COUNT,
    hits: 0,
    throws: [],
    lastShot: null,
    guide: { visible: true, aim: 50, strength: 62 },
    finished: false,
    message: "调好角度与力道，再投出一箭。风越偏，越要修正准头。",
  };
}

function normalizeTouhuGame(game) {
  const source = game && typeof game === "object" ? game : {};
  const arrowsLeft = clamp(Math.round(Number(source.arrowsLeft ?? TOUHU_ARROW_COUNT)), 0, TOUHU_ARROW_COUNT);
  return {
    aim: clamp(Math.round(Number(source.aim) || 50)),
    strength: clamp(Math.round(Number(source.strength) || 58)),
    wind: Math.max(-24, Math.min(24, Math.round(Number(source.wind) || 0))),
    arrowsLeft,
    hits: Math.max(0, Math.round(Number(source.hits) || 0)),
    throws: Array.isArray(source.throws) ? source.throws.slice(-TOUHU_ARROW_COUNT) : [],
    lastShot: source.lastShot && typeof source.lastShot === "object" ? source.lastShot : null,
    guide: normalizeTouhuGuide(source.guide),
    finished: !!source.finished || arrowsLeft <= 0,
    message: source.message || "调好角度与力道，再投出一箭。风越偏，越要修正准头。",
  };
}

function normalizeTouhuGuide(guide) {
  const source = guide && typeof guide === "object" ? guide : {};
  return {
    visible: source.visible !== false,
    aim: clamp(Math.round(Number(source.aim) || 50)),
    strength: clamp(Math.round(Number(source.strength) || 62)),
  };
}

function createXiangqiGame() {
  return {
    board: createXiangqiBoard(),
    selected: -1,
    winner: "",
    lastMove: null,
    moves: [],
    message: "你执红先行。车马炮兵各守其法，将帅照面亦算杀着。",
  };
}

function createXiangqiBoard() {
  const board = Array(XIANGQI_ROWS * XIANGQI_COLS).fill("");
  const place = (row, col, piece) => {
    board[xiangqiIndex(row, col)] = piece;
  };
  ["R", "N", "B", "A", "K", "A", "B", "N", "R"].forEach((type, col) => {
    place(0, col, `b${type}`);
    place(9, col, `r${type}`);
  });
  place(2, 1, "bC");
  place(2, 7, "bC");
  place(7, 1, "rC");
  place(7, 7, "rC");
  [0, 2, 4, 6, 8].forEach((col) => {
    place(3, col, "bP");
    place(6, col, "rP");
  });
  return board;
}

function normalizeXiangqiGame(game) {
  const source = game && typeof game === "object" ? game : {};
  const board = Array.isArray(source.board) ? source.board.slice(0, XIANGQI_ROWS * XIANGQI_COLS) : createXiangqiBoard();
  while (board.length < XIANGQI_ROWS * XIANGQI_COLS) board.push("");
  const selected = Number.isFinite(Number(source.selected)) ? Math.round(Number(source.selected)) : -1;
  return {
    board: board.map((piece) => (xiangqiPieceValid(piece) ? piece : "")),
    selected: selected >= 0 && selected < XIANGQI_ROWS * XIANGQI_COLS ? selected : -1,
    winner: ["player", "opponent", "draw"].includes(source.winner) ? source.winner : "",
    lastMove: normalizeXiangqiLastMove(source.lastMove),
    moves: Array.isArray(source.moves) ? source.moves.slice(-80) : [],
    message: source.message || "你执红先行。车马炮兵各守其法，将帅照面亦算杀着。",
  };
}

function normalizeXiangqiLastMove(move) {
  if (!move || typeof move !== "object") return null;
  const from = Math.round(Number(move.from));
  const to = Math.round(Number(move.to));
  if (!Number.isFinite(from) || !Number.isFinite(to) || from < 0 || to < 0 || from >= XIANGQI_ROWS * XIANGQI_COLS || to >= XIANGQI_ROWS * XIANGQI_COLS) return null;
  return { from, to, by: move.by === "opponent" ? "opponent" : "player", capture: xiangqiPieceValid(move.capture) ? move.capture : "" };
}

function xiangqiPieceValid(piece) {
  return typeof piece === "string" && /^[rb][KARNBCP]$/.test(piece);
}

function normalizeGamble(gamble) {
  const source = gamble && typeof gamble === "object" ? gamble : {};
  const currentBid = normalizeGambleBid(source.currentBid);
  const minimum = nextGambleBid(currentBid);
  const draftBid = normalizeGambleBid(source.draftBid) || minimum;
  const stake = Math.max(GAMBLE_MIN_STAKE, Math.round(Number(source.stake) || 50));
  const mode = source.mode === "guess" ? "paiGow" : ["call", "paiGow", "bigSmall"].includes(source.mode) ? source.mode : "call";
  return {
    mode,
    stake,
    playerDice: normalizeGambleDice(source.playerDice),
    opponentDice: normalizeGambleDice(source.opponentDice),
    currentBid,
    draftBid: isGambleBidLegal(draftBid, currentBid) ? draftBid : minimum,
    turn: source.revealed ? "" : source.turn === "opponent" ? "opponent" : "player",
    lastBidder: source.lastBidder === "opponent" ? "opponent" : source.lastBidder === "player" ? "player" : "",
    revealed: !!source.revealed,
    result: source.result || null,
    opponentName: source.opponentName || makePersonName("male"),
    opponentItem: source.opponentItem || sample(GAMBLE_OPPONENT_ITEMS) || "一匣银锭",
    guess: normalizeGuessDiceGame(source.guess, stake),
    paiGow: normalizePaiGowGame(source.paiGow, stake),
    bigSmall: normalizeBigSmallGame(source.bigSmall, stake),
  };
}

function slotKey(index) { return `${SAVE_PREFIX}${index}`; }

function loadSlotMeta() {
  try { return JSON.parse(localStorage.getItem(SAVE_META_KEY)) || []; } catch { return []; }
}
function saveSlotMeta(meta) { localStorage.setItem(SAVE_META_KEY, JSON.stringify(meta)); }

function firstEmptySlot(meta = loadSlotMeta()) {
  for (let i = 0; i < MAX_SLOTS; i += 1) {
    if (!meta[i]) return i;
  }
  return 0;
}

function updateSlotMeta(index, sourceState = state) {
  const meta = loadSlotMeta();
  while (meta.length <= index) meta.push(null);
  if (sourceState && !sourceState.dead) {
    meta[index] = { slot: index, name: sourceState.name || `存档位 ${index + 1}`, age: Math.round(Number(sourceState.age) || 0), timestamp: Date.now(), title: "进行中" };
  } else if (sourceState && sourceState.dead) {
    meta[index] = { slot: index, name: sourceState.name || `存档位 ${index + 1}`, age: Math.round(Number(sourceState.age) || 0), timestamp: Date.now(), title: sourceState.deathReason || "已故" };
  } else { meta[index] = null; }
  saveSlotMeta(meta);
}

function clearSlotMeta(index) {
  const meta = loadSlotMeta();
  if (meta[index]) meta[index] = null;
  saveSlotMeta(meta);
}

function loadSave(slot) {
  try {
    const raw = localStorage.getItem(slotKey(slot));
    return raw ? normalizeState(JSON.parse(raw)) : null;
  } catch { return null; }
}

function loadCurrentSave() {
  const meta = loadSlotMeta();
  for (let i = meta.length - 1; i >= 0; i--) {
    if (meta[i]) { const s = loadSave(i); if (s) { currentSlot = i; s.saveSlot = i; return s; } }
  }
  return migrateOldSave();
}

function migrateOldSave() {
  try {
    const raw = localStorage.getItem(SAVE_LEGACY_KEY);
    if (!raw) return null;
    const s = normalizeState(JSON.parse(raw));
    s.saveSlot = 0; currentSlot = 0;
    localStorage.setItem(slotKey(0), JSON.stringify(s));
    localStorage.removeItem(SAVE_LEGACY_KEY);
    updateSlotMeta(0, s);
    return s;
  } catch { return null; }
}

function save() {
  if (state && !state.__ephemeral && currentSlot >= 0) {
    state.saveSlot = currentSlot;
    localStorage.setItem(slotKey(currentSlot), JSON.stringify(state));
    updateSlotMeta(currentSlot, state);
  }
}

function clearSave() {
  if (currentSlot >= 0) {
    localStorage.removeItem(slotKey(currentSlot));
    clearSlotMeta(currentSlot);
    currentSlot = -1;
  }
}

function nextYear() {
  if (!state || state.dead || state.currentEvent || state.eventResult || state.pendingCaravan) return;
  SFX.play("page");
  state.age += 1;
  state.year += 1;
  state.lastDeltas = [];

  if (state.age === 1 && !state.tags.includes("抓周")) {
    state.tags.push("抓周");
    state.currentEvent = cloneEvent(START_EVENT);
    save();
    render();
    return;
  }

  if (state.prisonYears > 0) {
    state.prisonYears -= 1;
    changeStat("mood", -randInt(1, 4), state.lastDeltas);
    if (state.prisonYears <= 0) {
      state.tags = state.tags.filter((tag) => tag !== "入狱");
      addLog("出狱", "刑期已满，你离开牢狱，重见天日。", state.lastDeltas);
    } else {
      addLog("牢狱", `你在牢中又过一年，余刑 ${state.prisonYears} 年。`, state.lastDeltas);
    }
    finishYear();
    return;
  }

  applyAgeMilestones(state.lastDeltas);
  changeStat("mood", randInt(-2, 2), state.lastDeltas);
  changeStat("physique", state.age > 55 ? randInt(-4, -1) : randInt(-1, 2), state.lastDeltas);
  changeStat("money", state.career ? randInt(18, 80) : randInt(-10, 25), state.lastDeltas);
  const assetIncome = annualAssetIncome();
  if (assetIncome) {
    changeStat("money", assetIncome, state.lastDeltas);
    addLedger("家产进项", assetIncome, "名下产业送来一年收益。");
  }
  assetMarketEvent(state.lastDeltas);
  if (state.diseases.length) changeStat("physique", -state.diseases.length, state.lastDeltas);
  advanceFamilyYear(state.lastDeltas);
  advanceCricketYear(state.lastDeltas);
  annualRelationEvent(state.lastDeltas);
  annualSurpriseEvent(state.lastDeltas);

  if (shouldDie()) {
    die(state.age >= 100 ? "寿终正寝" : "体魄耗尽");
    save();
    render();
    return;
  }

  state.currentEvent = chooseEvent();
  if (!state.currentEvent) addLog("平年", "这一年无甚大事，日子仍照常向前。", state.lastDeltas);
  finishYear(false);
}

function finishYear(runAftermath = true) {
  if (runAftermath) runAnnualAftermath(state.lastDeltas);
  unlockLifeGoals();
  if (shouldDie()) die(state.age >= 100 ? "寿终正寝" : "体魄耗尽");
  save();
  render();
}

function runAnnualAftermath(deltas = state.lastDeltas) {
  advanceFamilyYear(deltas);
  advanceCricketYear(deltas);
  annualSurpriseEvent(deltas);
}

function shouldDie() {
  return state.age >= 100 || state.stats.physique <= 0;
}

function applyAgeMilestones(deltas = []) {
  state.life ||= normalizeLife();
  for (const milestone of AGE_MILESTONES) {
    if (state.age !== milestone.age || state.life.milestones.includes(milestone.id)) continue;
    SFX.play("milestone");
    state.life.milestones.push(milestone.id);
    for (const [stat, range] of Object.entries(milestone.effects || {})) changeStat(stat, rangeValue(range), deltas);
    if (milestone.tag && !state.tags.includes(milestone.tag)) state.tags.push(milestone.tag);
    addLog(milestone.title, milestone.text, deltas);
  }
}

function unlockLifeGoals() {
  state.life ||= normalizeLife();
  for (const goal of LIFE_GOALS) {
    if (state.life.goals.includes(goal.id) || !goal.done()) continue;
    state.life.goals.push(goal.id);
    if (!state.tags.includes(goal.title)) state.tags.push(goal.title);
    addLog("人生目标", `达成「${goal.title}」：${goal.desc}`, [{ label: "目标", value: goal.title }]);
  }
}

function lifePhase() {
  return LIFE_PHASES.find((phase) => state.age <= phase.max) || LIFE_PHASES[LIFE_PHASES.length - 1];
}

function completedGoals() {
  return LIFE_GOALS.filter((goal) => goal.done());
}

function nextGoals(limit = 3) {
  return LIFE_GOALS.filter((goal) => !goal.done()).slice(0, limit);
}

function lifeScore() {
  const statScore = Math.round((state.stats.mood + state.stats.physique + state.stats.eq + state.stats.knowledge + state.stats.virtue + state.stats.looks) / 6);
  const wealthScore = Math.min(180, Math.round(Math.max(0, state.stats.money) / 18) + (state.assets || []).length * 35);
  const relationScore = Math.min(140, (familyRows().length + state.friends.length + livingChildren().length) * 12);
  const examScore = Math.max(0, state.exam.rank + 1) * 70;
  const careerScore = Object.values(state.careerProgress || {}).reduce((sum, item) => sum + Math.max(1, Number(item.level) || 1) * 18, state.career ? 40 : 0);
  const goalScore = completedGoals().reduce((sum, goal) => sum + goal.score, 0);
  return statScore + wealthScore + relationScore + examScore + careerScore + goalScore + Math.min(120, state.log.length * 2);
}

function lifeGrade(score = lifeScore()) {
  if (score >= 900) return "传奇";
  if (score >= 680) return "显达";
  if (score >= 480) return "殷实";
  if (score >= 300) return "平顺";
  return "未定";
}

function lifeInsight() {
  if (state.dead) return "一生已定，可在命册里查看总评。";
  if (state.stats.physique < 35) return "体魄偏弱，先去医馆调理，别让好局半途折损。";
  if (state.age < MAIN_EXAM_MIN_AGE) return lifePhase().tip;
  if (state.age >= MAIN_EXAM_MIN_AGE && state.exam.rank < 0) return "童试已经开放，若想走科举路，现在该去书院了。";
  if (!state.career) return "还没有固定营生，先谋一份差事会让钱财更稳。";
  if (!(state.assets || []).length && state.stats.money >= 300) return "手头已有余钱，可以考虑置办家产。";
  const goal = nextGoals(1)[0];
  return goal ? goal.advice : "这一世目标大多已成，继续补命册、攒声名即可。";
}

function advanceFamilyYear(deltas) {
  for (const parent of [state.family.father, state.family.mother]) advanceRelationYear(parent, deltas, "parent");
  for (const sibling of state.family.siblings || []) advanceRelationYear(sibling, deltas, "sibling");
  if (state.family.spouseMeta) advanceRelationYear(state.family.spouseMeta, deltas, "spouse");
  if (state.family.loverMeta) advanceRelationYear(state.family.loverMeta, deltas, "lover");
  for (const friend of state.friends || []) advanceRelationYear(friend, deltas, "friend");

  for (const child of state.family.children || []) {
    if (!child.alive) continue;
    child.age += 1;
    child.physique = clamp(Number(child.physique ?? 70) - relationPhysiqueDecline(child.age, "child"));
    if (child.physique <= 0) {
      child.alive = false;
      child.physique = 0;
      deltas.push({ label: child.relation, value: "离世", negative: true });
      addLog("亲人离世", `${child.name || child.relation}体弱夭折，家中哀痛不已。`, [{ label: child.relation, value: `${child.age}岁`, negative: true }]);
      changeStat("mood", -randInt(10, 22), deltas);
      continue;
    }
    child.affection = clamp(child.affection + randInt(-2, 3));
    if (child.age <= 16) {
      child.study = clamp(child.study + randInt(0, child.aptitude >= 70 ? 4 : 2));
      child.virtue = clamp(child.virtue + randInt(-1, 2));
    }
    if ([1, 6, 12, 15].includes(child.age)) {
      const notes = {
        1: `${child.name}周岁，已能扶物学步。`,
        6: `${child.name}到了开蒙年纪，家中开始为其择书识字。`,
        12: `${child.name}渐知人事，性情越发分明。`,
        15: `${child.name}已到成丁之年，可承继家业。`,
      };
      addLog("子女成长", notes[child.age], [{ label: "子女", value: `${child.name}${child.age}岁` }]);
    }
  }

  if (canHaveChildThisYear()) {
    const child = makeChild(state.name.slice(0, 1), 0);
    state.family.children.push(child);
    changeStat("mood", randInt(4, 12), deltas);
    changeStat("relationship", randInt(3, 8), deltas);
    deltas.push({ label: "添丁", value: child.name });
    addLog("添丁", `家中添了${child.relation}${child.name}，乳名未定，眉眼间已有几分${child.trait}。`, [{ label: "子女", value: child.name }]);
  }
}

function relationPhysiqueDecline(age, kind = "friend") {
  if (kind === "child") return age <= 5 ? randInt(0, 2) : age >= 60 ? randInt(4, 8) : age >= 45 ? randInt(1, 4) : randInt(0, 1);
  if (age >= 75) return randInt(7, 13);
  if (age >= 65) return randInt(4, 9);
  if (age >= 55) return randInt(2, 5);
  if (age >= 42) return randInt(0, 3);
  return randInt(0, 1);
}

function advanceRelationYear(person, deltas = [], kind = "friend") {
  if (!person) return;
  const minimumAge = kind === "parent" ? 18 : 0;
  person.age = Math.max(minimumAge, Math.round(Number(person.age) || (kind === "parent" ? (person.gender === "male" ? 36 : 33) : state.age)));
  person.physique = clamp(Number(person.physique ?? 70));
  if (person.alive === false) return;
  person.age += 1;
  person.physique = clamp(person.physique - relationPhysiqueDecline(person.age, kind));
  person.affection = clamp(Number(person.affection ?? 68) + randInt(-1, 2));
  if (person.physique <= 0) {
    person.alive = false;
    person.physique = 0;
    deltas.push({ label: person.relation || "亲友", value: "离世", negative: true });
    addLog(kind === "friend" ? "故友离世" : "亲人离世", `${person.name || person.relation}年寿已尽，${kind === "friend" ? "旧友来信报丧。" : "家中设奠送别。"}`, [{ label: person.relation || "亲友", value: `${person.age}岁`, negative: true }]);
    changeStat("mood", kind === "friend" ? -randInt(3, 9) : -randInt(8, 18), deltas);
    if (kind === "parent") changeStat("virtue", randInt(1, 3), deltas);
  }
}

function annualRelationEvent(deltas = []) {
  if (Math.random() > 0.48) return;
  const candidates = [
    state.family.father,
    state.family.mother,
    ...(state.family.siblings || []),
    ...(state.friends || []),
    ...(livingChildren() || []),
  ].filter((person) => person && person.alive !== false);
  if (state.family.spouse && state.family.spouseMeta?.alive !== false) candidates.push({ ...state.family.spouseMeta, name: state.family.spouse, relation: "配偶", affection: state.family.spouseAffection || state.family.spouseMeta.affection || 78, spouseProxy: true });
  const person = sample(candidates);
  if (!person) return;
  const roll = Math.random();
  if (person.debt && roll < 0.25) {
    const amount = Math.min(person.debt, randInt(30, 160));
    person.debt -= amount;
    changeStat("money", amount, deltas);
    addLedger("亲友还钱", amount, `${person.name}归还旧日借款。`);
    addLog("亲友往来", `${person.name}托人送来 ${moneyText(amount)}，说是还你旧日情分。`, [{ label: "钱财", value: amount, stat: "money" }]);
    return;
  }
  if (roll < 0.34) {
    person.affection = clamp(Number(person.affection ?? 60) + randInt(2, 8));
    changeStat("relationship", randInt(1, 4), deltas);
    addLog("亲友走动", `${person.name}今年与你来往更勤，情分比往日亲近。`, [{ label: "亲友", value: person.name }]);
    return;
  }
  if (roll < 0.58) {
    const cost = Math.min(Math.max(0, state.stats.money), randInt(30, 140));
    if (cost > 0) {
      changeStat("money", -cost, deltas);
      person.affection = clamp(Number(person.affection ?? 60) + randInt(3, 10));
      addLedger("亲友周济", -cost, `周济${person.name}。`);
      addLog("亲友求助", `${person.name}一时周转不开，你帮衬了 ${moneyText(cost)}。`, [{ label: "钱财", value: -cost, stat: "money", negative: true }]);
    }
    return;
  }
  if (person.id?.startsWith?.("child-") || person.relation === "儿子" || person.relation === "女儿") {
    person.study = clamp(Number(person.study || 0) + randInt(2, 8));
    person.virtue = clamp(Number(person.virtue || 0) + randInt(1, 5));
    addLog("子女进益", `${person.name}今年读书做人都有长进。`, [{ label: "学业", value: Math.round(person.study || 0) }]);
    return;
  }
  if (person.spouseProxy) {
    state.family.spouseAffection = clamp(Number(state.family.spouseAffection || 78) + randInt(2, 7));
    changeStat("mood", randInt(1, 5), deltas);
    addLog("夫妻扶持", `${person.name}替你料理家事，一年里少了不少烦忧。`, [{ label: "情分", value: state.family.spouseAffection }]);
    return;
  }
  if (Math.random() > 0.72) {
    const disease = sample(["风寒", "劳损", "惊悸"]);
    addLog("亲友小恙", `${person.name}染了${disease}，托你得空去看看。`, [{ label: "亲友", value: person.name }]);
  }
}

function annualSurpriseEvent(deltas = []) {
  if (state.currentEvent || state.eventResult || state.pendingSurprise || state.dead) return;
  if (state.age < 2 || Math.random() > 0.34) return;
  const candidates = [
    state.family.father,
    state.family.mother,
    ...(state.family.siblings || []),
    ...(state.friends || []),
  ].filter((person) => person && person.alive !== false);
  if (state.family.spouse) candidates.push({ name: state.family.spouse, relation: "配偶" });
  const giver = sample(candidates);
  if (!giver) return;
  const gift = sample(ANNUAL_GIFTS) || ANNUAL_GIFTS[0];
  const received = addInventoryItem(gift.name, deltas);
  const relation = giver.relation || "亲友";
  const text = received
    ? `${giver.name || relation}念着你年岁渐长，送来${gift.note || gift.name}，说是日后总用得着。`
    : `${giver.name || relation}想送你${gift.note || gift.name}，只是行囊已满，只得暂且收回。`;
  changeStat("mood", received ? randInt(1, 5) : randInt(-2, 0), deltas);
  if (giver.affection !== undefined) giver.affection = clamp(Number(giver.affection ?? 60) + randInt(1, 5));
  state.pendingSurprise = {
    category: "亲友",
    title: received ? "惊喜" : "行囊已满",
    text,
    icon: gift.icon || "FamilyIcon",
  };
  view.overlay = "surprise";
  addLog(received ? "亲友赠礼" : "行囊已满", text, deltas);
}

function canHaveChildThisYear() {
  if (!state.family.spouse || state.prisonYears > 0) return false;
  if (state.family.spouseMeta?.alive === false) return false;
  if (state.age < 16 || state.age > 52) return false;
  if (state.gender === "female" && state.age > 45) return false;
  const living = livingChildren();
  if (living.length >= 8) return false;
  const chance = living.length ? 0.16 : 0.36;
  return Math.random() < chance;
}

function livingChildren() {
  return (state.family.children || []).filter((child) => child.alive !== false);
}

function adultChildren() {
  return livingChildren().filter((child) => child.age >= 15);
}

function eligibleHeirs() {
  return livingChildren().sort((a, b) => b.age - a.age || (b.aptitude + b.study + b.virtue) - (a.aptitude + a.study + a.virtue));
}

function chooseEvent() {
  const candidates = (DATA.randomEvents || []).filter((event) => {
    if (!bucketMatchesAge(event.bucket, state.age)) return false;
    if (event.category === "male" && state.gender !== "male") return false;
    if (event.category === "female" && state.gender !== "female") return false;
    return conditionsPass(event.conditions || []);
  });
  return cloneEvent(sample(candidates));
}

function bucketMatchesAge(bucket, age) {
  const nums = [...String(bucket || "").matchAll(/(\d+)/g)].map((match) => Number(match[1]));
  if (nums.length >= 2) return age >= nums[0] && age <= nums[1];
  return true;
}

function cloneEvent(event) {
  return event ? JSON.parse(JSON.stringify(event)) : null;
}

function chooseOption(index) {
  const event = state?.currentEvent;
  const choice = event?.children?.[index];
  if (!choice || !conditionsPass(choice.conditions || [])) return;

  const deltas = applyResults(choice.results || []);
  state.lastDeltas = mergeDeltas(state.pendingActivity?.deltas, deltas);
  const resultText = fillPlaceholders(choice.content || choice.history || choice.title);
  addLog(choice.title || event.title || "事件", resultText, deltas);
  const nextChildren = viableChildren(choice);
  state.currentEvent = nextChildren.length && !state.dead ? choice : null;
  unlockLifeGoals();
  if (!state.currentEvent) {
    state.eventResult = {
      title: choice.title || event.title || "结果",
      text: resultText,
      deltas,
      icon: resultIcon(choice, event),
    };
  }
  save();
  render();
}

function finishEvent() {
  if (!state?.currentEvent) return;
  SFX.play("event");
  addLog(state.currentEvent.title || "事件", fillPlaceholders(state.currentEvent.content || state.currentEvent.history || ""), state.lastDeltas);
  state.currentEvent = null;
  if (state.pendingActivity) return completePendingActivity();
  save();
  render();
}

function finishEventResult() {
  if (!state?.eventResult) return;
  state.eventResult = null;
  if (state.pendingActivity) return completePendingActivity();
  save();
  render();
}

function resultIcon(choice, event) {
  const text = `${choice?.title || ""}${choice?.content || ""}${event?.title || ""}`;
  if (/书|学|诗|文|卷|题/.test(text)) return "Book";
  if (/钱|财|银|铜|赏/.test(text)) return "CashBox";
  if (/病|医|药|疾/.test(text)) return "MedicineBag";
  if (/亲|友|父|母|兄|姐|妹/.test(text)) return "FamilyIcon";
  if (/酒|宴|楼/.test(text)) return "Restaurant";
  if (/狱|罪|罚/.test(text)) return "PrisonHeader";
  return "MainBook";
}

function viableChildren(event) {
  return (event.children || [])
    .map((child, index) => ({ child, index }))
    .filter(({ child }) => conditionsPass(child.conditions || []));
}

function applyResults(results) {
  const deltas = [];
  for (const result of results || []) {
    const method = result.method || "";
    const para = result.para || [];
    if (method === "InfluencePropertyOfInt" || method === "InfluenceRandomPropertyOfInt") {
      const target = findDataVar(para);
      const stat = target ? MEMBER_MAP[target.member] : null;
      if (!stat) continue;
      const value = method === "InfluenceRandomPropertyOfInt" ? randomFromPara(para) : fixedFromPara(para);
      changeStat(stat, value, deltas);
      continue;
    }
    if (method === "BecomeFriends") {
      const name = makePersonName(state.gender === "male" ? "female" : "male");
      if (!state.friends.some((friend) => friend.name === name)) {
        state.friends.push(normalizeFriend({ name, gender: Math.random() > 0.5 ? "male" : "female", affection: randInt(42, 76), lastMet: state.age }));
      }
      changeStat("relationship", randInt(3, 10), deltas);
      deltas.push({ label: "结交", value: name, type: "text" });
      continue;
    }
    if (method.includes("Sick")) {
      const disease = sample(["风寒", "跌打损伤", "惊悸", "头疾", "腹痛"]);
      if (!state.diseases.includes(disease)) state.diseases.push(disease);
      changeStat("physique", -randInt(3, 12), deltas);
      deltas.push({ label: "染疾", value: disease, negative: true });
      continue;
    }
    if (method.includes("Cure")) {
      const cured = state.diseases.shift();
      changeStat("physique", randInt(4, 12), deltas);
      deltas.push({ label: "痊愈", value: cured || "旧疾" });
      continue;
    }
    if (method === "InfluencePersonEnterPrison") {
      const years = Math.max(1, Math.abs(fixedFromPara(para)) || 1);
      state.prisonYears = Math.max(state.prisonYears, years);
      if (!state.tags.includes("入狱")) state.tags.push("入狱");
      changeStat("mood", -randInt(8, 18), deltas);
      changeStat("favorability", -randInt(1, 8), deltas);
      deltas.push({ label: "入狱", value: `${years}年`, negative: true });
      continue;
    }
    if (method.includes("Death")) {
      const reason = extractText(para) || "意外身故";
      die(reason);
      deltas.push({ label: "结局", value: reason, negative: true });
      continue;
    }
    if (method === "AddTag") {
      const tag = extractText(para) || "特殊经历";
      if (!state.tags.includes(tag)) state.tags.push(tag);
      deltas.push({ label: "标签", value: tag });
      continue;
    }
    if (method === "ToTemple") {
      if (!state.tags.includes("寺庙因缘")) state.tags.push("寺庙因缘");
      changeStat("virtue", randInt(1, 6), deltas);
      continue;
    }
    if (method === "InviteToParty") {
      changeStat("relationship", randInt(2, 8), deltas);
      continue;
    }
    if (method === "GoToBetNumber") {
      changeStat("money", Math.random() > 0.5 ? randInt(20, 100) : -randInt(20, 100), deltas);
      continue;
    }
    if (method === "GoToWhoreHouse") {
      changeStat("money", -randInt(20, 80), deltas);
      changeStat("mood", randInt(2, 8), deltas);
      continue;
    }
    if (method === "GoToChangeCityData") {
      state.location = sample(["清平县", "云州", "洛城", "江陵", "梁都"]) || state.location;
      deltas.push({ label: "迁居", value: state.location });
      continue;
    }
    if (method === "Dismiss") {
      changeStat("relationship", -randInt(2, 8), deltas);
      continue;
    }
    if (method === "ResetAvatar") {
      changeStat("looks", randInt(-3, 5), deltas);
      deltas.push({ label: "形貌", value: "有变" });
      continue;
    }
    if (method === "ChangedUpperLimitOfLife") {
      if (!state.tags.includes("延寿")) state.tags.push("延寿");
      changeStat("physique", randInt(4, 10), deltas);
      deltas.push({ label: "寿数", value: "有增" });
      continue;
    }
  }
  if (shouldDie() && !state.dead) die("体魄耗尽");
  return deltas;
}

function changeStat(stat, value, deltas) {
  const before = Number(state.stats[stat] || 0);
  let next = before + Number(value || 0);
  if (stat !== "money") next = clamp(next);
  state.stats[stat] = next;
  const actual = Math.round(next - before);
  if (actual && deltas) deltas.push({ label: STAT_LABELS[stat] || stat, value: actual, stat });
}

function die(reason) {
  if (state.dead) return;
  SFX.play("death");
  state.dead = true;
  state.deathReason = reason;
  state.currentEvent = null;
  state.pendingCaravan = null;
  addLog("身后事", `${state.name}于${state.age}岁${reason}。`);
}

function getActivity(id) {
  return ACTIVITIES.find((activity) => activity.id === id);
}

function openActivity(id) {
  const activity = getActivity(id);
  if (!activity || !state || state.dead) return;
  view.page = "activity";
  view.activityId = id;
  render();
}

function startActivity(id) {
  if (!state || state.dead || state.currentEvent || state.eventResult || state.pendingCaravan || state.prisonYears > 0) return;
  const activity = getActivity(id);
  if (!activity) return;
  const deltas = [];
  for (const [stat, range] of Object.entries(activity.effects || {})) changeStat(stat, rangeValue(range), deltas);
  if (activity.id === "restaurant") addFriend();
  if (activity.id === "medicine" && state.diseases.length) state.diseases.shift();
  if (activity.id === "academy" && !state.tags.includes("入学")) state.tags.push("入学");
  state.pendingActivity = { id: activity.id, label: activity.label, text: activity.text, deltas };
  state.lastDeltas = deltas;

  const event = chooseActivityEvent(activity);
  if (event) {
    state.currentEvent = event;
    view.page = "main";
    save();
    render();
    return;
  }
  addLog(activity.label, activity.text, deltas);
  completePendingActivity();
}

function performHomeAction(action) {
  if (!state || state.dead || state.currentEvent || state.eventResult || state.pendingCaravan || state.prisonYears > 0) return;
  const deltas = [];
  let title = "家中";
  let text = "";
  let iconName = "FamilyIcon";
  if (action === "study") {
    const gain = state.age < 8 ? randInt(1, 4) : randInt(3, 7);
    changeStat("knowledge", gain, deltas);
    changeStat("mood", state.age < 8 ? randInt(-1, 2) : randInt(-3, 0), deltas);
    addExamPrep(randInt(4, 9), deltas);
    if (!state.tags.includes("家学")) state.tags.push("家学");
    title = state.age < 8 ? "识字" : "温书";
    text = state.age < 8 ? "长辈握着你的手认字描红，纸上墨迹歪斜，却也一点点入眼。" : "你在家中温书一日，旧题与经义渐渐熟络。";
    iconName = "Book";
  } else if (action === "play") {
    changeStat("mood", randInt(4, 9), deltas);
    changeStat("physique", randInt(1, 4), deltas);
    if (Math.random() > 0.55) addFriend();
    title = "玩耍";
    text = "你在巷口与同龄人追逐玩闹，衣衫沾了尘，心里却畅快。";
    iconName = "BambooHorse";
  } else if (action === "chores") {
    const amount = state.age < 10 ? randInt(3, 12) : randInt(10, 42);
    changeStat("money", amount, deltas);
    changeStat("virtue", randInt(1, 4), deltas);
    changeStat("physique", randInt(0, 3), deltas);
    addLedger("家中帮忙", amount, "帮家里做些力所能及的事。");
    title = "帮忙";
    text = "你替家里扫院、送物、看火，虽是小事，也让长辈宽心。";
    iconName = "CashBox";
  } else if (action === "parents") {
    changeStat("relationship", randInt(2, 6), deltas);
    changeStat("virtue", randInt(1, 4), deltas);
    for (const person of [state.family.father, state.family.mother]) {
      if (person) person.affection = clamp(Number(person.affection ?? 72) + randInt(3, 8));
    }
    title = "听训";
    text = "父母与你说起持家、读书与做人，话不新鲜，却都是过来人的心血。";
    iconName = "FamilyIcon";
  } else if (action === "estate") {
    if (state.age < 15) return;
    changeStat("eq", randInt(2, 5), deltas);
    changeStat("money", randInt(20, 80), deltas);
    changeStat("mood", -randInt(0, 3), deltas);
    title = "整理家业";
    text = "你清点家中账册与器物，知道柴米银钱从不是小事。";
    iconName = "CashBox";
  } else {
    return;
  }
  state.lastDeltas = deltas;
  addLog(title, text, deltas);
  state.age += 1;
  state.year += 1;
  applyAgeMilestones(deltas);
  view.page = "main";
  finishYear();
}

function chooseActivityEvent(activity) {
  const buckets = expandActivityBuckets(activity?.buckets || []);
  const events = DATA.activityEvents || [];
  const strict = events.filter((event) => buckets.includes(event.bucket) && conditionsPass(event.conditions || []));
  if (strict.length) return cloneEvent(sample(strict));
  const relaxed = events.filter((event) => buckets.includes(event.bucket) && event.children?.length);
  if (relaxed.length) return cloneEvent(sample(relaxed));
  const any = events.filter((event) => conditionsPass(event.conditions || []));
  return cloneEvent(sample(any));
}

function expandActivityBuckets(buckets) {
  const related = {
    Restaurant: ["Restaurant", "News", "DrinkFlowerWine"],
    News: ["News", "Restaurant"],
    ParentsThings: ["ParentsThings", "FemaleSisterEvent"],
    FemaleSisterEvent: ["FemaleSisterEvent", "ParentsThings", "Restaurant"],
    Administration: ["Administration", "PrisonAction", "News"],
    PrisonAction: ["PrisonAction", "Administration"],
    SleepInWhorehouse: ["SleepInWhorehouse", "DrinkFlowerWine", "Restaurant"],
    DrinkFlowerWine: ["DrinkFlowerWine", "Restaurant", "SleepInWhorehouse"],
    ImperialCollege: ["ImperialCollege", "News"],
    BuddhistEvent: ["BuddhistEvent", "News"],
    Agriculture: ["Agriculture", "News"],
    StudyInShangYaoJuEvent: ["StudyInShangYaoJuEvent", "News"],
    Alchemist: ["Alchemist", "StudyInShangYaoJuEvent"],
  };
  return [...new Set((buckets || []).flatMap((bucket) => related[bucket] || [bucket]))];
}

function completePendingActivity() {
  const pending = state.pendingActivity;
  if (!pending) return;
  state.pendingActivity = null;
  state.age += 1;
  state.year += 1;
  if (!state.lastDeltas?.length) state.lastDeltas = pending.deltas || [];
  applyAgeMilestones(state.lastDeltas);
  view.page = "main";
  finishYear();
}

function careerStory(career = state.career) {
  return CAREER_STORY_OVERRIDES[career?.name || ""] || null;
}

function careerDisplayText(career, lockReason = "") {
  if (lockReason) return lockReason;
  const story = careerStory(career);
  if (story?.summary) return story.summary;
  if (career.assumeText || career.desc) return career.assumeText || career.desc;
  return {
    official: "入县衙办差，案牍文书与百姓生计都要经手。",
    craft: "凭手艺吃饭，器物成败全在眼力和火候。",
    art: "以雅艺谋生，既要有本事，也要懂客人心意。",
    service: "在店铺馆舍当值，脚勤眼快才能得赏。",
    labor: "靠脚力与筋骨讨生活，辛苦却踏实。",
    mystic: "行走玄门阴阳之间，香火钱里也有风险。",
    female: "以女红、歌舞、教习或妆饰谋生，技艺与名声相连。",
    caravan: "押镖护货、结队行商，风险越高，收益越厚。",
    common: "谋一份寻常差事，积攒钱财与阅历。",
  }[careerKind(career)] || "谋一份寻常差事，积攒钱财与阅历。";
}

function careerJoinText(career) {
  const story = careerStory(career);
  if (story?.join) return story.join;
  return careerKind(career) === "official"
    ? `你入了官场，初授${officialTitle()}，自此案牍政务皆系身前。`
    : `你入了${career.name}，自此有了一份安身营生。`;
}

function takeCareer(index) {
  if (!state || state.dead || state.prisonYears > 0 || state.age < 15) return;
  const career = allCareers()[Number(index)];
  if (!career) return;
  if (careerLockedReason(career)) return;
  state.career = career;
  state.careerProgress[career.name] ||= { exp: 0, level: 1 };
  if (careerKind(career) === "official") {
    state.official.unlocked = true;
    state.official.rank = Math.max(officialRankIndex(), hasPalaceAppointment() ? 1 : 0);
  }
  state.lastDeltas = [{ label: "营生", value: career.name }];
  addLog("谋职", careerJoinText(career), state.lastDeltas);
  unlockLifeGoals();
  view.tab = careerKind(career) === "caravan" ? "career" : "overview";
  save();
  render();
}

function careerKind(career = state.career) {
  if (career?.customKind) return career.customKind;
  const type = Number(career?.careerType ?? career?.CareerType);
  const genderRequire = Number(career?.genderRequire ?? career?.GenderRequire);
  const name = career?.name || "";
  if (type === 5) return "official";
  if (type === 1) return genderRequire === 1 ? "female" : "craft";
  if (type === 2) return "art";
  if (type === 3 || type === 4) return "mystic";
  if (type === 0 && genderRequire === 1) return "female";
  if (/县|衙|主簿|县丞/.test(name)) return "official";
  if (/木匠|玉匠|铁匠/.test(name)) return "craft";
  if (/画师|琴师|弈师|茶师/.test(name)) return "art";
  if (/跑堂|伙夫|厨娘/.test(name)) return "service";
  if (/镖|行商|商路/.test(name)) return "caravan";
  if (/车夫|担夫/.test(name)) return "labor";
  if (/禅师|道士|守墓人|摸金/.test(name)) return "mystic";
  if (/歌姬|舞姬|绣娘|妆娘|闺塾师/.test(name)) return "female";
  return "common";
}

function careerActions() {
  const kind = careerKind();
  const careerName = state.career?.name || "";
  if (CAREER_ACTION_OVERRIDES[careerName]) return CAREER_ACTION_OVERRIDES[careerName];
  const maps = {
    caravan: [
      ["route:county", "近郊短镖", "低风险短线，收益稳当。"],
      ["route:merchant", "云州商路", "中等风险，收益更高。"],
      ["route:frontier", "边关重镖", "高风险高收益，可能受伤。"],
      ["route:night", "夜走险货", "极高风险，来钱最快，也最危险。"],
    ],
    official: [
      ["routine", "处理政务", "积累政绩，兼得俸禄。"],
      ["case", "断案巡察", "考验处世与德行，成败都有名望变化。"],
    ],
    craft: [
      ["routine", "接一单活", "靠手艺换钱，也磨砺体魄。"],
      ["masterwork", "打造精品", "耗材颇多，若成则名利双收。"],
    ],
    art: [
      ["routine", "授艺卖艺", "以雅事谋生，得钱也得人情。"],
      ["masterwork", "闭门创作", "耗时伤神，成名则名望上涨。"],
    ],
    service: [
      ["routine", "当值劳作", "辛苦一日，换得稳当薪钱。"],
      ["case", "招待贵客", "若应对得宜，赏钱不少。"],
    ],
    labor: [
      ["routine", "跑一趟差", "体力营生，钱来得实在。"],
      ["risk", "接险路", "路远难行，收益和风险都更高。"],
    ],
    mystic: [
      ["routine", "行一桩法事", "玄门差事，德行与钱财都有波动。"],
      ["risk", "探幽问禁", "可能得奇遇，也可能惹祸。"],
    ],
    female: [
      ["routine", "接待女客", "以技艺与仪态谋生。"],
      ["masterwork", "献一门绝艺", "若得赏识，名声渐起。"],
    ],
    common: [["routine", "做工", "尽一日本分，得些薪钱。"]],
  };
  return maps[kind] || maps.common;
}

function performCareerAction(type) {
  if (!state.career || state.dead || state.currentEvent || state.eventResult || state.pendingCaravan || state.prisonYears > 0 || state.age < 15) return;
  const kind = careerKind();
  if (kind === "caravan") return performCaravanRoute(String(type || "").replace("route:", "") || "county");
  const deltas = [];
  const progress = (state.careerProgress[state.career.name] ||= { exp: 0, level: 1 });
  let title = state.career.name;
  let text = "";
  const levelBonus = Math.max(0, Number(progress.level) || 1);
  if (kind === "official") {
    const office = officialOffice();
    const rankBonus = Math.floor(officialRankIndex() / 3);
    const merit = (type === "case" ? randInt(12, 32) : randInt(7, 18)) + rankBonus;
    state.official.merit += merit;
    changeStat("eq", randInt(1, 5), deltas);
    changeStat("virtue", type === "case" ? randInt(-2, 5) : randInt(-1, 3), deltas);
    changeStat("money", randInt(25, 90) + levelBonus * 8 + rankBonus * 12, deltas);
    text = type === "case"
      ? `你以${office.office}身份审理疑案，斟酌人情法理，得政绩 ${merit}。`
      : `你处理${office.scope}政务，${office.duty}得政绩 ${merit}。`;
    text += applyOfficialPromotion(deltas);
  } else {
    const risky = type === "risk" || type === "masterwork";
    const success = !risky || Math.random() + (state.stats.eq + state.stats.knowledge + levelBonus * 5) / 260 > 0.62;
    const basePay = {
      craft: [55, 160],
      art: [45, 150],
      service: [25, 95],
      labor: [35, 120],
      mystic: [45, 180],
      female: [40, 150],
      common: [25, 80],
    }[kind] || [25, 80];
    const pay = success ? randInt(basePay[0], basePay[1]) + levelBonus * 10 : randInt(-80, 20);
    changeStat("money", pay, deltas);
    if (kind === "craft") changeStat("physique", randInt(1, 4), deltas);
    if (kind === "art" || kind === "female") changeStat("looks", randInt(0, 3), deltas);
    if (kind === "service") changeStat("eq", randInt(1, 4), deltas);
    if (kind === "labor") changeStat("physique", risky && !success ? -randInt(2, 7) : randInt(1, 5), deltas);
    if (kind === "mystic") changeStat("virtue", success ? randInt(1, 5) : -randInt(1, 5), deltas);
    if (risky) changeStat("mood", success ? randInt(2, 6) : -randInt(3, 9), deltas);
    text = success ? `你在${state.career.name}一业上颇有所得，今日进账 ${moneyText(Math.max(0, pay))}。` : `这一桩差事不顺，折了心力，也没赚到什么。`;
  }
  progress.exp = Math.max(0, Number(progress.exp || 0) + randInt(8, type === "routine" ? 18 : 32));
  if (progress.exp >= progress.level * 80) {
    progress.exp -= progress.level * 80;
    progress.level += 1;
    deltas.push({ label: "技艺", value: `${progress.level}级` });
    text += ` 你的本业技艺升至 ${progress.level} 级。`;
  }
  text += careerIncident(kind, type, deltas, progress);
  addLedger(title, deltas.filter((delta) => delta.stat === "money").reduce((sum, delta) => sum + Number(delta.value || 0), 0), text);
  unlockLifeGoals();
  finishAction(title, text, deltas, careerIcon(kind));
}

function careerIncident(kind, type, deltas, progress) {
  const personal = careerPersonalIncident(type, deltas, progress);
  if (personal) return personal;
  if (Math.random() > 0.42) return "";
  const level = Math.max(1, Number(progress?.level) || 1);
  const addMoney = (min, max) => {
    const amount = randInt(min, max) + level * 8;
    changeStat("money", amount, deltas);
    return amount;
  };
  if (kind === "official") {
    if (type === "case" && Math.random() > 0.45) {
      changeStat("favorability", randInt(1, 4), deltas);
      return " 此事处置公允，辖地百姓多有称道。";
    }
    changeStat("eq", randInt(1, 3), deltas);
    return " 案牍之外，你也学会几分官场往来。";
  }
  if (kind === "craft") {
    const amount = addMoney(20, 90);
    return ` 东家见你手艺稳当，额外赏了 ${moneyText(amount)}。`;
  }
  if (kind === "art" || kind === "female") {
    changeStat("relationship", randInt(2, 6), deltas);
    return " 有客人赏识你的才艺，替你在席间扬名。";
  }
  if (kind === "service") {
    const amount = addMoney(10, 70);
    return ` 今日遇上阔客，散席时另给赏钱 ${moneyText(amount)}。`;
  }
  if (kind === "labor") {
    const hurt = type === "risk" && Math.random() > 0.5;
    changeStat("physique", hurt ? -randInt(2, 6) : randInt(1, 3), deltas);
    return hurt ? " 路上风雨难行，腿脚也磨出了伤。" : " 这趟脚程顺利，筋骨反倒练得更稳。";
  }
  if (kind === "mystic") {
    if (Math.random() > 0.5) {
      if (!state.tags.includes("玄门见闻")) state.tags.push("玄门见闻");
      changeStat("virtue", randInt(1, 4), deltas);
      return " 你见一桩玄门异事，心中多了几分敬畏。";
    }
    changeStat("mood", -randInt(1, 5), deltas);
    return " 这桩差事阴冷古怪，回家后仍觉心中不宁。";
  }
  changeStat("eq", randInt(1, 3), deltas);
  return " 日常做工里也有人情世故，慢慢都成了经验。";
}

function careerPersonalIncident(type, deltas, progress) {
  const story = careerStory();
  if (!story || Math.random() > 0.72) return "";
  const kind = careerKind();
  const key = story[type] ? type : type === "case" && story.routine ? "routine" : type === "masterwork" && story.routine ? "routine" : type === "risk" && story.risk ? "risk" : "routine";
  const pool = story[key] || story.routine || [];
  if (!pool.length) return "";
  const level = Math.max(1, Number(progress?.level) || 1);
  const deltasByKind = {
    official: [["eq", [1, 3]], ["virtue", [-1, 3]]],
    craft: [["physique", [1, 3]], ["favorability", [0, 2]]],
    art: [["relationship", [1, 4]], ["mood", [0, 3]]],
    service: [["eq", [1, 4]], ["money", [6, 28]]],
    labor: [["physique", [1, 4]], ["money", [8, 34]]],
    mystic: [["virtue", [-1, 4]], ["mood", [-2, 3]]],
    female: [["looks", [0, 3]], ["relationship", [1, 4]]],
    common: [["eq", [1, 3]]],
  }[kind] || [["eq", [1, 3]]];
  deltasByKind.forEach(([stat, range]) => {
    let value = rangeValue(range);
    if (stat === "money" && value > 0) value += level * 4;
    changeStat(stat, value, deltas);
  });
  if ((type === "masterwork" || type === "case") && Math.random() > 0.48) changeStat("favorability", randInt(1, 3), deltas);
  if (type === "risk" && Math.random() > 0.55) changeStat("physique", -randInt(1, 5), deltas);
  return ` ${sample(pool)}`;
}

function performCaravanRoute(routeId) {
  if (state.pendingCaravan) return;
  const route = caravanRouteById(routeId);
  if (!route || state.stats.money < route.cost) {
    state.eventResult = {
      title: "镖银不足",
      text: "押镖行商须先备脚钱、车马与押货本钱，手头钱财还不够。",
      deltas: [],
      icon: "CashBox",
    };
    state.lastDeltas = [];
    render();
    return;
  }
  const deltas = [];
  const progress = (state.careerProgress[state.career.name] ||= { exp: 0, level: 1 });
  const level = Math.max(1, Number(progress.level) || 1);
  const events = pickMany(CARAVAN_EVENTS, route.stages).map((event) => event.id);
  changeStat("money", -route.cost, deltas);
  addLedger("押镖本钱", -route.cost, `接下${route.label}，预支车马脚钱。`);
  state.pendingCaravan = normalizeCaravanRun({
    id: `caravan-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    routeId: route.id,
    index: 0,
    events,
    cargo: 100,
    bonus: 0,
    loss: route.cost,
    injury: 0,
    failures: 0,
    severe: false,
    routeRisk: caravanRouteRisk(route, level),
    startedAge: state.age,
    deltas,
    history: [{ event: "出发", choice: route.label, ok: true, text: `你押下 ${moneyText(route.cost)} 本钱，车队从${state.location}启程。`, cargo: 100 }],
  });
  state.lastDeltas = deltas;
  view.page = "main";
  view.tab = "career";
  save();
  render();
}

function caravanRouteById(routeId) {
  return CARAVAN_ROUTES.find((item) => item.id === routeId) || CARAVAN_ROUTES[0];
}

function caravanEventById(eventId) {
  return CARAVAN_EVENTS.find((item) => item.id === eventId || item.title === eventId) || CARAVAN_EVENTS[0];
}

function normalizeCaravanMemory(memory) {
  const source = memory && typeof memory === "object" ? memory : {};
  return Object.fromEntries(
    CARAVAN_ROUTES.map((route) => {
      const item = source[route.id] && typeof source[route.id] === "object" ? source[route.id] : {};
      return [
        route.id,
        {
          runs: Math.max(0, Math.round(Number(item.runs) || 0)),
          failures: Math.max(0, Math.round(Number(item.failures) || 0)),
          last: item.last || "",
          cargo: clamp(Number(item.cargo ?? 100), 0, 100),
          lastAge: Number.isFinite(Number(item.lastAge)) ? Number(item.lastAge) : -1,
        },
      ];
    })
  );
}

function normalizeCaravanRun(run, fallbackAge = 0) {
  if (!run || typeof run !== "object") return null;
  const route = caravanRouteById(run.routeId);
  if (!route) return null;
  const events = Array.isArray(run.events)
    ? run.events.map((item) => (typeof item === "string" ? item : item?.id || item?.title)).filter(Boolean)
    : pickMany(CARAVAN_EVENTS, route.stages).map((event) => event.id);
  return {
    id: run.id || `caravan-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    routeId: route.id,
    index: clamp(Math.round(Number(run.index) || 0), 0, Math.max(0, events.length)),
    events,
    cargo: clamp(Number(run.cargo ?? 100), 0, 100),
    bonus: Math.max(0, Math.round(Number(run.bonus) || 0)),
    loss: Math.max(0, Math.round(Number(run.loss) || 0)),
    injury: Math.max(0, Math.round(Number(run.injury) || 0)),
    failures: Math.max(0, Math.round(Number(run.failures) || 0)),
    severe: !!run.severe,
    routeRisk: Math.max(4, Math.round(Number(run.routeRisk) || route.risk)),
    startedAge: Number.isFinite(Number(run.startedAge)) ? Number(run.startedAge) : fallbackAge,
    deltas: Array.isArray(run.deltas) ? run.deltas : [],
    history: Array.isArray(run.history) ? run.history.map(normalizeCaravanHistory).filter(Boolean).slice(-12) : [],
  };
}

function normalizeCaravanHistory(item) {
  if (!item || typeof item !== "object") return null;
  return {
    event: item.event || "途中",
    choice: item.choice || "应对",
    ok: item.ok !== false,
    text: item.text || "",
    cargo: clamp(Number(item.cargo ?? 100), 0, 100),
  };
}

function caravanRouteRisk(route, level = 1) {
  const ability = Math.floor(((state.stats.eq || 50) + (state.stats.knowledge || 50) + (state.stats.physique || 50)) / 45);
  return Math.max(4, Math.round(route.risk - Math.max(1, level) * 3 - ability));
}

function caravanChoiceDefinitions(event, run, route) {
  const toll = Math.max(8, Math.round(route.cost * (event.id === "checkpoint" ? 0.42 : 0.28)));
  return [
    {
      id: "force",
      label: event.id === "bandit" ? "拔刀护镖" : "强行通过",
      stat: "physique",
      modifier: event.id === "bandit" ? 15 : event.id === "weather" ? -5 : 2,
      note: "靠体魄硬扛，成则快，败则最易伤身。",
      cargoFail: [12, 26],
      hurtScale: 1.05,
      bonus: [10, 34],
    },
    {
      id: "talk",
      label: event.id === "weather" ? "雇人探路" : "交涉打点",
      stat: "eq",
      modifier: event.id === "checkpoint" || event.id === "merchant" ? 16 : 8,
      cost: toll,
      note: `花 ${moneyText(toll)} 求稳，失败损失较小。`,
      cargoFail: [5, 14],
      hurtScale: 0.35,
      bonus: [0, 18],
    },
    {
      id: "scheme",
      label: event.id === "weather" ? "改走高路" : "绕路设法",
      stat: "knowledge",
      modifier: event.id === "weather" || event.id === "inn" ? 16 : 8,
      note: "靠判断避险，可能耽误时辰、折损货物。",
      cargoFail: [7, 18],
      hurtScale: 0.45,
      bonus: [4, 24],
    },
    {
      id: "retreat",
      label: "暂避退让",
      safe: true,
      note: "跳过冲突，保命优先，但货物必有折损。",
      cargoDamage: [8, 22],
    },
  ];
}

function chooseCaravanOption(choiceId) {
  const run = normalizeCaravanRun(state.pendingCaravan);
  if (!run || state.dead) return;
  const route = caravanRouteById(run.routeId);
  if (choiceId === "finish" || run.index >= run.events.length) return finishCaravanRun(run);
  const event = caravanEventById(run.events[run.index]);
  if (!route || !event) return finishCaravanRun(run);
  const choice = caravanChoiceDefinitions(event, run, route).find((item) => item.id === choiceId) || caravanChoiceDefinitions(event, run, route)[0];
  const deltas = run.deltas;
  if (choice.safe) {
    const damage = randInt(choice.cargoDamage[0], choice.cargoDamage[1]) + Math.max(0, Math.floor(run.routeRisk / 25));
    run.cargo = clamp(run.cargo - damage, 0, 100);
    run.loss += damage;
    run.history.push({
      event: event.title,
      choice: choice.label,
      ok: true,
      text: `你暂避锋芒，车队绕行半日，货物折损 ${damage}%。`,
      cargo: run.cargo,
    });
  } else {
    const cost = Math.min(Math.max(0, Math.round(choice.cost || 0)), Math.max(0, Math.round(state.stats.money || 0)));
    if (cost > 0) {
      changeStat("money", -cost, deltas);
      run.loss += cost;
      addLedger("押镖打点", -cost, `${event.title}时选择${choice.label}。`);
    }
    const progress = (state.careerProgress[state.career.name] ||= { exp: 0, level: 1 });
    const level = Math.max(1, Number(progress.level) || 1);
    const statScore = Number(state.stats[choice.stat] || 50);
    const roll = randInt(1, 100) + Math.floor(statScore / 3) + level * 5 + Number(choice.modifier || 0);
    const target = 58 + Math.round(run.routeRisk * 0.7) + event.danger;
    const ok = roll >= target;
    if (ok) {
      const bonus = Math.max(0, randInt(choice.bonus[0], choice.bonus[1]) + level * 3 - Math.floor(run.routeRisk / 12));
      run.bonus += bonus;
      run.history.push({
        event: event.title,
        choice: choice.label,
        ok: true,
        text: `${event.success}，这一路又多攒下 ${moneyText(bonus)} 镖利。`,
        cargo: run.cargo,
      });
    } else {
      const cargoLoss = randInt(choice.cargoFail[0], choice.cargoFail[1]) + Math.max(0, Math.floor(run.routeRisk / 18));
      const hurt = Math.max(0, Math.round(randInt(event.hurt[0], event.hurt[1]) * Number(choice.hurtScale || 1)) + Math.max(0, Math.floor(run.routeRisk / 28)));
      run.failures += 1;
      run.cargo = clamp(run.cargo - cargoLoss, 0, 100);
      run.injury += hurt;
      run.loss += cargoLoss;
      run.severe ||= hurt >= 12 || Math.random() < route.deathRisk + event.deathRisk;
      if (hurt > 0) changeStat("physique", -hurt, deltas);
      changeStat("mood", -randInt(1, 4), deltas);
      run.history.push({
        event: event.title,
        choice: choice.label,
        ok: false,
        text: `${event.fail}，货物折损 ${cargoLoss}%${hurt ? `，你也受伤 ${hurt} 点` : ""}。`,
        cargo: run.cargo,
      });
    }
  }
  run.index += 1;
  state.pendingCaravan = normalizeCaravanRun(run, state.age);
  state.lastDeltas = deltas;
  if (state.stats.physique <= 0 && run.severe) {
    state.pendingCaravan = null;
    state.eventResult = null;
    die("押镖途中重伤不治");
    save();
    render();
    return;
  }
  if (run.index >= run.events.length || run.cargo <= 0) return finishCaravanRun(run);
  save();
  render();
}

function finishCaravanRun(sourceRun = state.pendingCaravan) {
  const run = normalizeCaravanRun(sourceRun, state.age);
  if (!run) return;
  const route = caravanRouteById(run.routeId);
  const deltas = run.deltas;
  const progress = (state.careerProgress[state.career.name] ||= { exp: 0, level: 1 });
  const level = Math.max(1, Number(progress.level) || 1);
  const cargoRatio = clamp(run.cargo, 0, 100) / 100;
  const success = run.cargo >= 45 && run.failures <= Math.ceil(run.events.length / 2);
  let reward = 0;
  let compensation = 0;
  if (success) {
    reward = Math.round(randInt(route.reward[0], route.reward[1]) * cargoRatio + run.bonus + level * 18);
    changeStat("money", reward, deltas);
    changeStat("eq", randInt(1, 4), deltas);
    changeStat("physique", randInt(0, 3), deltas);
    changeStat("favorability", route.risk >= 50 ? randInt(1, 3) : 1, deltas);
    addLedger("押镖收入", reward, `${route.label}交货得银，货物完好 ${Math.round(run.cargo)}%。`);
  } else {
    compensation = Math.min(Math.max(0, Math.round(state.stats.money || 0)), randInt(18, Math.max(36, route.cost + route.risk * 2)));
    if (compensation) changeStat("money", -compensation, deltas);
    changeStat("mood", -randInt(3, 10), deltas);
    if (route.virtueLoss) changeStat("virtue", -randInt(1, 4), deltas);
    addLedger("押镖赔付", -compensation, `${route.label}未能交清，赔付货主。`);
  }
  const successScore = Math.max(0, run.events.length - run.failures);
  progress.exp = Math.max(0, Number(progress.exp || 0) + route.exp + successScore * 6 + (success ? 12 : 0));
  let levelText = "";
  if (progress.exp >= progress.level * 80) {
    progress.exp -= progress.level * 80;
    progress.level += 1;
    deltas.push({ label: "镖路", value: `${progress.level}级` });
    levelText = ` 镖路经验升至 ${progress.level} 级。`;
  }
  const summary = {
    route: route.label,
    success,
    cargo: Math.round(run.cargo),
    failures: run.failures,
    injury: run.injury,
    reward,
    compensation,
    bonus: run.bonus,
    events: run.history,
  };
  updateCaravanMemory(route, summary);
  const title = success ? `${route.label}告捷` : `${route.label}失手`;
  const text = `${success ? "你护货抵达，货主清点无误。" : "车队折损，货主脸色极差。"}货物完好 ${summary.cargo}%，途中失手 ${summary.failures} 次。${levelText}`;
  unlockLifeGoals();
  state.pendingCaravan = null;
  state.lastDeltas = deltas;
  addLog(title, text, deltas);
  state.eventResult = { title, text, deltas, icon: "RepairCarriage", caravan: summary };
  save();
  if (!success && run.severe && Math.random() < route.deathRisk + 0.01) {
    state.eventResult = null;
    die(sample(run.events.map(caravanEventById))?.death || "押镖途中遇险身故");
    save();
  }
  render();
}

function updateCaravanMemory(route, summary) {
  state.caravanMemory = normalizeCaravanMemory(state.caravanMemory);
  const memory = state.caravanMemory[route.id] || { runs: 0, failures: 0, last: "", cargo: 100, lastAge: -1 };
  memory.runs += 1;
  if (!summary.success) memory.failures += 1;
  const lastEvent = [...(summary.events || [])].reverse().find((item) => item.event !== "出发");
  memory.last = `${summary.success ? "成" : "败"} · ${lastEvent?.event || route.label} · 货 ${summary.cargo}%`;
  memory.cargo = summary.cargo;
  memory.lastAge = state.age;
  state.caravanMemory[route.id] = memory;
}

function caravanMemoryText(route) {
  const memory = state.caravanMemory?.[route.id];
  if (!memory || !memory.runs) return "";
  return `旧闻：跑过 ${memory.runs} 趟，失手 ${memory.failures} 趟；上次 ${memory.lastAge} 岁，${memory.last}`;
}

function allCareers() {
  return [...(DATA.database?.careers || []), ...CUSTOM_CAREERS];
}

function caravanRouteSummary() {
  return `
    <div class="route-summary">
      ${CARAVAN_ROUTES.map((route) => `
        <article>
          <strong>${escapeHtml(route.label)}</strong>
          <span>本钱 ${moneyText(route.cost)} · 风险 ${route.risk} · 收益 ${moneyText(route.reward[0])}-${moneyText(route.reward[1])}</span>
          <small>${escapeHtml(route.note)}</small>
          ${caravanMemoryText(route) ? `<small class="route-memory">${escapeHtml(caravanMemoryText(route))}</small>` : ""}
        </article>`).join("")}
    </div>`;
}

function careerIcon(kind) {
  return { official: "Official", craft: "Craftsman", art: "BambooFlute", service: "Restaurant", labor: "RepairCarriage", caravan: "RepairCarriage", mystic: "Temple", female: "FemaleSkill" }[kind] || "CashBox";
}

function careerKindLabel(kind) {
  return { official: "官府", craft: "匠作", art: "艺业", service: "店铺", labor: "脚力", caravan: "押镖行商", mystic: "玄门", female: "女业", common: "杂工" }[kind] || "杂工";
}

function officialCareerSummary() {
  const office = officialOffice();
  const need = nextOfficialMeritNeed();
  return `
      ${infoLine("官职", `${office.grade} · ${office.office}`)}
      ${infoLine("辖务", `${office.scope} · ${office.duty}`)}
      ${infoLine("官评", `${Math.round(state.official.merit || 0)} 政绩${need ? ` · 距 ${nextOfficialTitle()} 还差 ${need}` : " · 位极人臣"}`)}`;
}

function annualAssetIncome() {
  return (state.assets || []).reduce((sum, item) => {
    const condition = clamp(Number(item.condition ?? 72), 20, 120) / 100;
    const level = Math.max(1, Number(item.level) || 1);
    const modeFactor = item.mode === "self" ? 1.18 : 0.92;
    return sum + Math.round(Number(item.income || 0) * level * modeFactor * condition * (0.75 + Math.random() * 0.5));
  }, 0);
}

function assetMarketEvent(deltas = []) {
  if (!state.assets?.length || Math.random() > 0.28) return;
  const asset = sample(state.assets);
  if (!asset) return;
  const assetIndex = state.assets.indexOf(asset);
  const displayName = assetDisplayName(asset, assetIndex);
  const good = Math.random() > 0.42;
  const modeRisk = asset.mode === "self" ? 1.25 : 0.85;
  const amount = good
    ? randInt(Math.max(8, Math.round((asset.income || 20) * 0.5)), Math.max(18, Math.round((asset.income || 20) * 1.5)))
    : -randInt(12, Math.max(24, Math.round((asset.income || 20) * 1.2 * modeRisk)));
  changeStat("money", amount, deltas);
  asset.condition = clamp(Number(asset.condition ?? 72) + (good ? randInt(-2, 4) : -randInt(5, 14)), 15, 120);
  const title = good ? "家产旺收" : "家产修缮";
  const text = good ? `${displayName}今年行情不错，额外添了一笔进项。` : `${displayName}需修缮打点，额外折了一笔钱。`;
  addLedger(title, amount, text);
  addLog(title, text, [{ label: "家产", value: displayName }, { label: "钱财", value: amount, stat: "money" }]);
}

function addLedger(title, amount, text) {
  state.ledger ||= [];
  state.ledger.unshift({ age: state.age, title, amount: Math.round(amount || 0), text });
  state.ledger = state.ledger.slice(0, 120);
}

function buyAsset(index) {
  if (!state || state.dead || state.age < 15) return;
  const item = PROPERTY_CATALOG[Number(index)];
  if (!item || state.stats.money < item.price) return;
  changeStat("money", -item.price, state.lastDeltas = []);
  const owned = {
    ...item,
    id: `asset-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    boughtAt: state.age,
    level: 1,
    condition: randInt(62, 88),
    mode: "rent",
  };
  state.assets.push(owned);
  const count = assetCountByName(item.name);
  const displayName = assetDisplayName(owned, state.assets.length - 1);
  state.lastDeltas = [{ label: "置产", value: displayName }, { label: "钱财", value: -item.price, stat: "money", negative: true }];
  addLedger("置办家产", -item.price, `买下${displayName}。`);
  addLog("置产", `你花 ${moneyText(item.price)} 置办了${displayName}。同类家产已有 ${count} 处。${item.desc}`, state.lastDeltas);
  unlockLifeGoals();
  save();
  render();
}

function assetCountByName(name) {
  return (state.assets || []).filter((asset) => asset.name === name).length;
}

function assetInstanceNumber(asset, index) {
  return (state.assets || []).slice(0, index + 1).filter((item) => item.name === asset.name).length;
}

function assetDisplayName(asset, index) {
  const count = assetCountByName(asset.name);
  if (count <= 1) return asset.name;
  return `${asset.name}（第${assetInstanceNumber(asset, index)}处）`;
}

function manageAsset(index, action) {
  if (!state || state.dead || state.age < 15 || state.prisonYears > 0) return;
  const asset = state.assets[Number(index)];
  if (!asset) return;
  const displayName = assetDisplayName(asset, Number(index));
  const deltas = [];
  let title = "家产";
  let text = "";
  if (action === "repair") {
    const cost = Math.max(30, Math.round((asset.income || 20) * 1.6));
    if (state.stats.money < cost) return;
    changeStat("money", -cost, deltas);
    asset.condition = clamp(Number(asset.condition ?? 72) + randInt(10, 24));
    addLedger("家产修缮", -cost, `修缮${displayName}。`);
    title = "修缮家产";
    text = `${displayName}修缮一新，日后少些漏损。`;
  } else if (action === "expand") {
    const cost = Math.max(120, Math.round((asset.price || 200) * 0.38));
    if (state.stats.money < cost) return;
    changeStat("money", -cost, deltas);
    asset.level = Math.max(1, Number(asset.level) || 1) + 1;
    asset.income = Math.round(Number(asset.income || 10) * 1.28 + 8);
    asset.condition = clamp(Number(asset.condition ?? 70) - randInt(4, 10));
    addLedger("扩建家产", -cost, `扩建${displayName}。`);
    title = "扩建";
    text = `${displayName}添置扩建，年入涨至 ${moneyText(asset.income)}。`;
  } else if (action === "mode") {
    asset.mode = asset.mode === "self" ? "rent" : "self";
    title = "经营方式";
    text = asset.mode === "self" ? `${displayName}改为自营，收益更高但需多费心力。` : `${displayName}改为出租，收益稳些，风险也低。`;
    deltas.push({ label: "家产", value: asset.mode === "self" ? "自营" : "出租" });
  } else {
    return;
  }
  finishAction(title, text, deltas, asset.icon || "House");
}

function travelTo(index) {
  if (!state || state.dead || state.age < 6 || state.prisonYears > 0) return;
  const dest = TRAVEL_DESTINATIONS[Number(index)];
  if (!dest || state.stats.money < dest.cost) return;
  state.lastDeltas = [];
  changeStat("money", -dest.cost, state.lastDeltas);
  changeStat(dest.stat, randInt(1, 4), state.lastDeltas);
  state.location = dest.name;
  addLedger("车马路资", -dest.cost, `前往${dest.name}。`);
  addLog("出行", `你乘车马前往${dest.name}。${dest.note}`, state.lastDeltas);
  save();
  render();
}

function useSpecialPlace(id) {
  if (!state || state.dead || state.prisonYears > 0) return;
  const deltas = [];
  let title = "活动";
  let text = "";
  if (id === "gamble") {
    view.page = "gamble";
    render();
    return;
  } else if (id === "miniGames") {
    state.miniGames = normalizeMiniGames(state.miniGames);
    view.page = "miniGames";
    render();
    return;
  } else if (id === "theater") {
    const story = sample(THEATER_WATCH_STORIES);
    applyEffectRanges(story.effects, deltas);
    if (story.friend) addFriend();
    if (story.item) addInventoryItem(story.item, deltas);
    title = story.title || "瓦舍";
    text = story.text || "台上锣鼓喧天，散场时你仍觉余音在耳。";
  } else if (id === "friend") {
    addFriend();
    changeStat("relationship", randInt(3, 8), deltas);
    title = "会友";
    text = "你走动亲友，席间闲谈让彼此更亲近。";
  } else if (id === "matchmaker") {
    const name = makePersonName(state.gender === "male" ? "female" : "male");
    state.family.lover = name;
    state.family.loverMeta = normalizeRelative({ name, relation: "相看之人", gender: state.gender === "male" ? "female" : "male", affection: 64 }, state.name.slice(0, 1), "partner");
    changeStat("relationship", randInt(3, 8), deltas);
    title = "媒人";
    text = `媒人替你相看了${name}，说是颇有缘分。`;
  } else if (id === "blackMarket") {
    return openBlackMarket();
  }
  state.lastDeltas = deltas;
  state.eventResult = { title, text, deltas, icon: resultIcon({ title, content: text }, null) };
  addLog(title, text, deltas);
  save();
  render();
}

function ensureMiniGames() {
  state.miniGames = normalizeMiniGames(state.miniGames);
  return state.miniGames;
}

function setMiniGameTab(tab) {
  const miniGames = ensureMiniGames();
  miniGames.tab = MINI_GAME_TABS.some(([id]) => id === tab) ? tab : "gomoku";
  save();
  render();
}

function resetGomokuGame() {
  const miniGames = ensureMiniGames();
  miniGames.gomoku = createGomokuGame();
  miniGames.tab = "gomoku";
  save();
  render();
}

function playGomokuCell(index) {
  if (!state || state.dead || state.prisonYears > 0) return;
  const miniGames = ensureMiniGames();
  const game = normalizeGomokuGame(miniGames.gomoku);
  const move = Math.round(Number(index));
  if (game.winner || !Number.isFinite(move) || move < 0 || move >= game.board.length || game.board[move]) return;

  game.board[move] = 1;
  game.lastMove = move;
  game.moves.push({ by: "player", index: move });
  if (checkGomokuWin(game.board, move, 1)) {
    game.winner = "player";
    game.message = "你五子连珠，赢下这一局。";
    miniGames.gomoku = game;
    return finishGomokuGame("player");
  }
  if (gomokuBoardFull(game.board)) {
    game.winner = "draw";
    game.message = "棋盘落满，双方和局。";
    miniGames.gomoku = game;
    return finishGomokuGame("draw");
  }

  const aiMove = chooseGomokuMove(game.board);
  if (aiMove >= 0) {
    game.board[aiMove] = 2;
    game.lastMove = aiMove;
    game.moves.push({ by: "opponent", index: aiMove });
    if (checkGomokuWin(game.board, aiMove, 2)) {
      game.winner = "opponent";
      game.message = "对手应声成五，这局你输了。";
      miniGames.gomoku = game;
      return finishGomokuGame("opponent");
    }
  }

  if (gomokuBoardFull(game.board)) {
    game.winner = "draw";
    game.message = "棋盘落满，双方和局。";
    miniGames.gomoku = game;
    return finishGomokuGame("draw");
  }
  game.message = aiMove >= 0 ? "对手已经落子，轮到你了。" : "轮到你落子。";
  miniGames.gomoku = game;
  save();
  render();
}

function finishGomokuGame(result) {
  const miniGames = ensureMiniGames();
  const deltas = [];
  let title = "五子棋";
  let text = "";
  if (result === "player") {
    SFX.play("win");
    miniGames.record.gomokuWins += 1;
    const prize = randInt(12, 36);
    changeStat("mood", randInt(3, 7), deltas);
    changeStat("eq", randInt(1, 3), deltas);
    changeStat("favorability", 1, deltas);
    changeStat("money", prize, deltas);
    addLedger("五子棋彩头", prize, "雅戏局中赢得些许彩头。");
    title = "五子棋胜";
    text = `你在雅戏席上五子连珠，赢得 ${moneyText(prize)} 彩头，也博得旁人叫好。`;
  } else if (result === "opponent") {
    miniGames.record.gomokuLosses += 1;
    changeStat("mood", randInt(-3, -1), deltas);
    changeStat("eq", 1, deltas);
    title = "五子棋负";
    text = "你一着不慎，被对手抢先成五。虽输了棋，倒也记住一条棋路。";
  } else {
    miniGames.record.gomokuDraws += 1;
    changeStat("mood", randInt(1, 3), deltas);
    changeStat("eq", 1, deltas);
    title = "五子棋和";
    text = "这一局双方缠斗许久，终成和局。";
  }
  state.lastDeltas = deltas;
  addLog(title, text, deltas);
  save();
  render();
}

function chooseGomokuMove(board) {
  const empties = gomokuCandidateCells(board);
  if (!empties.length) return -1;
  const center = Math.floor(GOMOKU_SIZE / 2) * GOMOKU_SIZE + Math.floor(GOMOKU_SIZE / 2);
  if (!board[center]) return center;

  for (const cell of empties) {
    board[cell] = 2;
    const wins = checkGomokuWin(board, cell, 2);
    board[cell] = 0;
    if (wins) return cell;
  }
  for (const cell of empties) {
    board[cell] = 1;
    const blocks = checkGomokuWin(board, cell, 1);
    board[cell] = 0;
    if (blocks) return cell;
  }

  let best = empties[0];
  let bestScore = -Infinity;
  for (const cell of empties) {
    const score = gomokuMoveScore(board, cell, 2) * 1.08 + gomokuMoveScore(board, cell, 1);
    const row = Math.floor(cell / GOMOKU_SIZE);
    const col = cell % GOMOKU_SIZE;
    const centerBias = 14 - Math.abs(row - 7) - Math.abs(col - 7);
    const total = score + centerBias * 0.8 + Math.random() * 0.35;
    if (total > bestScore) {
      bestScore = total;
      best = cell;
    }
  }
  return best;
}

function gomokuCandidateCells(board) {
  if (!board.some(Boolean)) return [Math.floor(GOMOKU_SIZE / 2) * GOMOKU_SIZE + Math.floor(GOMOKU_SIZE / 2)];
  const cells = new Set();
  board.forEach((value, index) => {
    if (!value) return;
    const row = Math.floor(index / GOMOKU_SIZE);
    const col = index % GOMOKU_SIZE;
    for (let dr = -2; dr <= 2; dr += 1) {
      for (let dc = -2; dc <= 2; dc += 1) {
        const nr = row + dr;
        const nc = col + dc;
        if (nr < 0 || nr >= GOMOKU_SIZE || nc < 0 || nc >= GOMOKU_SIZE) continue;
        const next = nr * GOMOKU_SIZE + nc;
        if (!board[next]) cells.add(next);
      }
    }
  });
  return [...cells];
}

function gomokuMoveScore(board, index, player) {
  const row = Math.floor(index / GOMOKU_SIZE);
  const col = index % GOMOKU_SIZE;
  const dirs = [
    [1, 0],
    [0, 1],
    [1, 1],
    [1, -1],
  ];
  return dirs.reduce((sum, [dr, dc]) => {
    const forward = gomokuRay(board, row, col, dr, dc, player);
    const backward = gomokuRay(board, row, col, -dr, -dc, player);
    const line = 1 + forward.count + backward.count;
    const open = forward.open + backward.open;
    return sum + line * line * (open + 1) + (line >= 4 ? 120 : line >= 3 && open ? 36 : 0);
  }, 0);
}

function gomokuRay(board, row, col, dr, dc, player) {
  let count = 0;
  let r = row + dr;
  let c = col + dc;
  while (r >= 0 && r < GOMOKU_SIZE && c >= 0 && c < GOMOKU_SIZE && board[r * GOMOKU_SIZE + c] === player) {
    count += 1;
    r += dr;
    c += dc;
  }
  const open = r >= 0 && r < GOMOKU_SIZE && c >= 0 && c < GOMOKU_SIZE && board[r * GOMOKU_SIZE + c] === 0 ? 1 : 0;
  return { count, open };
}

function checkGomokuWin(board, index, player) {
  const row = Math.floor(index / GOMOKU_SIZE);
  const col = index % GOMOKU_SIZE;
  return [
    [1, 0],
    [0, 1],
    [1, 1],
    [1, -1],
  ].some(([dr, dc]) => 1 + gomokuRay(board, row, col, dr, dc, player).count + gomokuRay(board, row, col, -dr, -dc, player).count >= 5);
}

function gomokuBoardFull(board) {
  return board.every(Boolean);
}

function resetXiangqiGame() {
  const miniGames = ensureMiniGames();
  miniGames.xiangqi = createXiangqiGame();
  miniGames.tab = "xiangqi";
  save();
  render();
}

function handleXiangqiCell(index) {
  if (!state || state.dead || state.prisonYears > 0) return;
  const miniGames = ensureMiniGames();
  const game = normalizeXiangqiGame(miniGames.xiangqi);
  const cell = Math.round(Number(index));
  if (game.winner || !Number.isFinite(cell) || cell < 0 || cell >= game.board.length) return;
  const piece = game.board[cell];
  if (game.selected < 0) {
    if (xiangqiSide(piece) === "r") {
      game.selected = cell;
      game.message = `${xiangqiPieceName(piece)}已选中，请点可走位置。`;
      miniGames.xiangqi = game;
      save();
      render();
    }
    return;
  }

  if (cell === game.selected) {
    game.selected = -1;
    game.message = "已取消选中。";
    miniGames.xiangqi = game;
    save();
    render();
    return;
  }

  if (xiangqiSide(piece) === "r") {
    game.selected = cell;
    game.message = `${xiangqiPieceName(piece)}已选中，请点可走位置。`;
    miniGames.xiangqi = game;
    save();
    render();
    return;
  }

  const legalMoves = xiangqiLegalMoves(game.board, game.selected, "r");
  if (!legalMoves.includes(cell)) {
    game.message = "这一步不合棋规，换个落点。";
    miniGames.xiangqi = game;
    save();
    render();
    return;
  }

  const playerMove = { from: game.selected, to: cell, by: "player", capture: game.board[cell] || "" };
  game.board = makeXiangqiMove(game.board, game.selected, cell);
  game.selected = -1;
  game.lastMove = playerMove;
  game.moves.push(playerMove);
  if (playerMove.capture === "bK" || !game.board.includes("bK")) {
    game.winner = "player";
    game.message = "你擒住黑将，棋局已定。";
    miniGames.xiangqi = game;
    return finishXiangqiGame("player");
  }

  const aiMove = chooseXiangqiMove(game.board, "b");
  if (!aiMove) {
    game.winner = "player";
    game.message = "对手无棋可应，你胜了这一局。";
    miniGames.xiangqi = game;
    return finishXiangqiGame("player");
  }

  const response = { from: aiMove.from, to: aiMove.to, by: "opponent", capture: game.board[aiMove.to] || "" };
  game.board = makeXiangqiMove(game.board, aiMove.from, aiMove.to);
  game.lastMove = response;
  game.moves.push(response);
  if (response.capture === "rK" || !game.board.includes("rK")) {
    game.winner = "opponent";
    game.message = "红帅被擒，这局你输了。";
    miniGames.xiangqi = game;
    return finishXiangqiGame("opponent");
  }
  if (!xiangqiAllLegalMoves(game.board, "r").length) {
    game.winner = "opponent";
    game.message = "你已无棋可走，这局对手占了上风。";
    miniGames.xiangqi = game;
    return finishXiangqiGame("opponent");
  }

  const playerInCheck = xiangqiInCheck(game.board, "r");
  const opponentInCheck = xiangqiInCheck(game.board, "b");
  game.message = playerInCheck
    ? `对手${xiangqiPieceName(game.board[response.to])}落在${xiangqiCoord(response.to)}，正在将军。`
    : opponentInCheck
      ? "你这一手余势仍在，对手将位吃紧。"
      : `你走${xiangqiMoveText(playerMove)}，对手应${xiangqiMoveText(response)}。轮到你了。`;
  miniGames.xiangqi = game;
  save();
  render();
}

function finishXiangqiGame(result) {
  const miniGames = ensureMiniGames();
  const deltas = [];
  let title = "象棋";
  let text = "一局象棋罢了，席间仍在复盘。";
  if (result === "player") {
    SFX.play("win");
    miniGames.record.xiangqiWins += 1;
    const prize = randInt(20, 70);
    changeStat("mood", randInt(3, 7), deltas);
    changeStat("eq", randInt(1, 3), deltas);
    changeStat("knowledge", randInt(1, 3), deltas);
    changeStat("money", prize, deltas);
    addLedger("象棋彩头", prize, "雅戏席上弈棋得彩。");
    title = "象棋取胜";
    text = `你审势弃取，最终擒住对方主帅，赢得 ${moneyText(prize)} 彩头。`;
  } else {
    miniGames.record.xiangqiLosses += 1;
    changeStat("mood", randInt(-3, -1), deltas);
    changeStat("eq", 1, deltas);
    changeStat("knowledge", 1, deltas);
    title = "象棋失利";
    text = "你一处疏漏被对手抓住，虽然输了棋，也记下一路攻守变化。";
  }
  state.lastDeltas = deltas;
  addLog(title, text, deltas);
  save();
  render();
}

function chooseXiangqiMove(board, side) {
  const moves = xiangqiRankedMoves(board, side, XIANGQI_AI_CANDIDATE_LIMIT);
  if (!moves.length) return null;
  const scored = moves.map((move) => ({ move, score: xiangqiSearchMove(board, move, side, XIANGQI_AI_DEPTH) }));
  scored.sort((a, b) => b.score - a.score);
  const pool = scored.slice(0, Math.min(3, scored.length));
  return weightedSampleMove(pool);
}

function xiangqiSearchMove(board, move, side, depth) {
  const opponent = xiangqiOpponent(side);
  const nextBoard = makeXiangqiMove(board, move.from, move.to);
  const capture = board[move.to];
  if (capture === `${opponent}K` || !nextBoard.includes(`${opponent}K`)) return 100000;
  let score = xiangqiEvaluateBoard(nextBoard, side) + xiangqiMoveHeuristic(board, move, side);
  if (depth <= 1) return score;

  const replies = xiangqiRankedMoves(nextBoard, opponent, XIANGQI_AI_REPLY_LIMIT);
  if (!replies.length) return score + 2000;
  const bestReply = replies.reduce((best, reply) => {
    const replyBoard = makeXiangqiMove(nextBoard, reply.from, reply.to);
    const replyScore = xiangqiEvaluateBoard(replyBoard, opponent) + xiangqiMoveHeuristic(nextBoard, reply, opponent);
    return Math.max(best, replyScore);
  }, -Infinity);
  return score - bestReply * 0.82;
}

function xiangqiMoveHeuristic(board, move, side) {
  const opponent = xiangqiOpponent(side);
  const piece = board[move.from];
  const target = board[move.to];
  const nextBoard = makeXiangqiMove(board, move.from, move.to);
  const row = Math.floor(move.to / XIANGQI_COLS);
  const col = move.to % XIANGQI_COLS;
  const pieceValue = XIANGQI_VALUES[xiangqiType(piece)] || 0;
  const captureValue = target ? XIANGQI_VALUES[xiangqiType(target)] || 0 : 0;
  const centerBias = 8 - Math.abs(col - 4) * 2;
  const advance = side === "b" ? row : XIANGQI_ROWS - 1 - row;
  const checkBonus = xiangqiInCheck(nextBoard, opponent) ? 140 : 0;
  const threatened = xiangqiSquareAttacked(nextBoard, move.to, opponent);
  const protectedByFriend = xiangqiSquareGuarded(nextBoard, move.to, side);
  const danger = threatened ? pieceValue * (protectedByFriend ? 0.18 : 0.42) : 0;
  const recaptureRisk = captureValue && threatened ? Math.min(captureValue, pieceValue) * 0.18 : 0;
  const developing = xiangqiMoveDevelops(piece, move) ? 18 : 0;
  return captureValue * 1.18 + centerBias * 5 + advance * 4 + checkBonus + developing - danger - recaptureRisk + Math.random() * 5;
}

function xiangqiEvaluateBoard(board, side) {
  const opponent = xiangqiOpponent(side);
  let score = 0;
  board.forEach((piece, index) => {
    if (!xiangqiPieceValid(piece)) return;
    const owner = xiangqiSide(piece);
    const sign = owner === side ? 1 : -1;
    const type = xiangqiType(piece);
    score += sign * ((XIANGQI_VALUES[type] || 0) + xiangqiPositionBonus(piece, index));
  });
  score += xiangqiAllLegalMoves(board, side).length * 3;
  score -= xiangqiAllLegalMoves(board, opponent).length * 2.6;
  if (xiangqiInCheck(board, opponent)) score += 120;
  if (xiangqiInCheck(board, side)) score -= 180;
  score += xiangqiKingSafety(board, side) - xiangqiKingSafety(board, opponent);
  return score;
}

function xiangqiPositionBonus(piece, index) {
  const side = xiangqiSide(piece);
  const type = xiangqiType(piece);
  const row = Math.floor(index / XIANGQI_COLS);
  const col = index % XIANGQI_COLS;
  const center = 8 - Math.abs(col - 4) * 2;
  const advance = side === "b" ? row : XIANGQI_ROWS - 1 - row;
  if (type === "P") return advance * 16 + (advance >= 5 ? center * 5 : 0);
  if (type === "N") return center * 8 + (row > 0 && row < 9 ? 12 : -8);
  if (type === "C") return center * 5 + (advance >= 3 ? 14 : 0);
  if (type === "R") return center * 4 + (advance >= 2 ? 10 : 0);
  if (type === "K") return xiangqiInPalace(row, col, side) ? 18 : -60;
  return 8;
}

function xiangqiKingSafety(board, side) {
  const king = board.indexOf(`${side}K`);
  if (king < 0) return -10000;
  const row = Math.floor(king / XIANGQI_COLS);
  const col = king % XIANGQI_COLS;
  let guards = 0;
  [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([dr, dc]) => {
    const r = row + dr;
    const c = col + dc;
    if (!xiangqiInside(r, c)) return;
    if (xiangqiSide(board[xiangqiIndex(r, c)]) === side) guards += 1;
  });
  return guards * 16 - (xiangqiInCheck(board, side) ? 120 : 0);
}

function xiangqiMoveDevelops(piece, move) {
  const type = xiangqiType(piece);
  const fromRow = Math.floor(move.from / XIANGQI_COLS);
  const toRow = Math.floor(move.to / XIANGQI_COLS);
  if (type === "N" || type === "C") return fromRow !== toRow;
  if (type === "R") return Math.abs(toRow - fromRow) >= 2;
  return false;
}

function weightedSampleMove(scoredMoves) {
  if (!scoredMoves.length) return null;
  if (scoredMoves.length === 1) return scoredMoves[0].move;
  const bestScore = scoredMoves[0].score;
  const weights = scoredMoves.map((item, index) => Math.max(1, 22 - index * 7 + Math.max(-6, item.score - bestScore) * 0.04));
  const total = weights.reduce((sum, value) => sum + value, 0);
  let roll = Math.random() * total;
  for (let i = 0; i < scoredMoves.length; i += 1) {
    roll -= weights[i];
    if (roll <= 0) return scoredMoves[i].move;
  }
  return scoredMoves[0].move;
}

function xiangqiAllLegalMoves(board, side) {
  const moves = [];
  board.forEach((piece, index) => {
    if (xiangqiSide(piece) !== side) return;
    for (const to of xiangqiLegalMoves(board, index, side)) moves.push({ from: index, to });
  });
  return moves;
}

function xiangqiRankedMoves(board, side, limit = Infinity) {
  const moves = xiangqiAllLegalMoves(board, side);
  if (!Number.isFinite(limit) || moves.length <= limit) return moves;
  return moves
    .map((move) => ({ move, score: xiangqiMoveHeuristic(board, move, side) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.move);
}

function xiangqiOpponent(side) {
  return side === "r" ? "b" : "r";
}

function xiangqiLegacyMoveScore(board, side) {
  const moves = xiangqiAllLegalMoves(board, side);
  if (!moves.length) return null;
  let best = moves[0];
  let bestScore = -Infinity;
  for (const move of moves) {
    const target = board[move.to];
    const nextBoard = makeXiangqiMove(board, move.from, move.to);
    const row = Math.floor(move.to / XIANGQI_COLS);
    const col = move.to % XIANGQI_COLS;
    const centerBias = 8 - Math.abs(col - 4);
    const advance = side === "b" ? row : XIANGQI_ROWS - 1 - row;
    const checkBonus = xiangqiInCheck(nextBoard, side === "b" ? "r" : "b") ? 80 : 0;
    const danger = xiangqiSquareAttacked(nextBoard, move.to, side === "b" ? "r" : "b") ? XIANGQI_VALUES[xiangqiType(board[move.from])] * 0.22 : 0;
    const score = (target ? XIANGQI_VALUES[xiangqiType(target)] || 0 : 0) + centerBias * 4 + advance * 2 + checkBonus - danger + Math.random() * 12;
    if (score > bestScore) {
      bestScore = score;
      best = move;
    }
  }
  return best;
}

function xiangqiLegalMoves(board, index, side = xiangqiSide(board[index]), safe = true) {
  if (!xiangqiPieceValid(board[index]) || xiangqiSide(board[index]) !== side) return [];
  const moves = xiangqiPseudoMoves(board, index);
  if (!safe) return moves;
  return moves.filter((to) => !xiangqiInCheck(makeXiangqiMove(board, index, to), side));
}

function xiangqiPseudoMoves(board, index) {
  const piece = board[index];
  if (!xiangqiPieceValid(piece)) return [];
  const side = xiangqiSide(piece);
  const type = xiangqiType(piece);
  const row = Math.floor(index / XIANGQI_COLS);
  const col = index % XIANGQI_COLS;
  const moves = [];
  const add = (r, c) => {
    if (!xiangqiInside(r, c)) return;
    const target = board[xiangqiIndex(r, c)];
    if (xiangqiSide(target) !== side) moves.push(xiangqiIndex(r, c));
  };

  if (type === "K") {
    [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dr, dc]) => {
      const r = row + dr;
      const c = col + dc;
      if (xiangqiInPalace(r, c, side)) add(r, c);
    });
    for (let r = row + (side === "r" ? -1 : 1); r >= 0 && r < XIANGQI_ROWS; r += side === "r" ? -1 : 1) {
      const target = board[xiangqiIndex(r, col)];
      if (!target) continue;
      if (target === `${side === "r" ? "b" : "r"}K`) moves.push(xiangqiIndex(r, col));
      break;
    }
  } else if (type === "A") {
    [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([dr, dc]) => {
      const r = row + dr;
      const c = col + dc;
      if (xiangqiInPalace(r, c, side)) add(r, c);
    });
  } else if (type === "B") {
    [[2, 2], [2, -2], [-2, 2], [-2, -2]].forEach(([dr, dc]) => {
      const r = row + dr;
      const c = col + dc;
      const eye = xiangqiIndex(row + dr / 2, col + dc / 2);
      if (!xiangqiInside(r, c) || board[eye]) return;
      if (side === "r" && r < 5) return;
      if (side === "b" && r > 4) return;
      add(r, c);
    });
  } else if (type === "N") {
    [
      [2, 1, 1, 0],
      [2, -1, 1, 0],
      [-2, 1, -1, 0],
      [-2, -1, -1, 0],
      [1, 2, 0, 1],
      [-1, 2, 0, 1],
      [1, -2, 0, -1],
      [-1, -2, 0, -1],
    ].forEach(([dr, dc, lr, lc]) => {
      const legR = row + lr;
      const legC = col + lc;
      if (!xiangqiInside(legR, legC) || board[xiangqiIndex(legR, legC)]) return;
      add(row + dr, col + dc);
    });
  } else if (type === "R") {
    xiangqiRayMoves(board, row, col, side, false).forEach((move) => moves.push(move));
  } else if (type === "C") {
    xiangqiRayMoves(board, row, col, side, true).forEach((move) => moves.push(move));
  } else if (type === "P") {
    const forward = side === "r" ? -1 : 1;
    add(row + forward, col);
    const crossed = side === "r" ? row <= 4 : row >= 5;
    if (crossed) {
      add(row, col - 1);
      add(row, col + 1);
    }
  }
  return moves;
}

function xiangqiRayMoves(board, row, col, side, cannon) {
  const moves = [];
  [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dr, dc]) => {
    let r = row + dr;
    let c = col + dc;
    let screen = false;
    while (xiangqiInside(r, c)) {
      const index = xiangqiIndex(r, c);
      const target = board[index];
      if (!cannon) {
        if (!target) {
          moves.push(index);
        } else {
          if (xiangqiSide(target) !== side) moves.push(index);
          break;
        }
      } else if (!screen) {
        if (!target) {
          moves.push(index);
        } else {
          screen = true;
        }
      } else if (target) {
        if (xiangqiSide(target) !== side) moves.push(index);
        break;
      }
      r += dr;
      c += dc;
    }
  });
  return moves;
}

function xiangqiInCheck(board, side) {
  const king = board.indexOf(`${side}K`);
  if (king < 0) return true;
  return xiangqiSquareAttacked(board, king, side === "r" ? "b" : "r");
}

function xiangqiSquareAttacked(board, index, attackingSide) {
  return board.some((piece, from) => xiangqiSide(piece) === attackingSide && xiangqiPseudoMoves(board, from).includes(index));
}

function xiangqiSquareGuarded(board, index, guardingSide) {
  const probe = board.slice();
  probe[index] = `${xiangqiOpponent(guardingSide)}P`;
  return probe.some((piece, from) => from !== index && xiangqiSide(piece) === guardingSide && xiangqiPseudoMoves(probe, from).includes(index));
}

function makeXiangqiMove(board, from, to) {
  const next = board.slice();
  next[to] = next[from];
  next[from] = "";
  return next;
}

function xiangqiIndex(row, col) {
  return row * XIANGQI_COLS + col;
}

function xiangqiInside(row, col) {
  return row >= 0 && row < XIANGQI_ROWS && col >= 0 && col < XIANGQI_COLS;
}

function xiangqiInPalace(row, col, side) {
  if (col < 3 || col > 5) return false;
  return side === "r" ? row >= 7 && row <= 9 : row >= 0 && row <= 2;
}

function xiangqiSide(piece) {
  return xiangqiPieceValid(piece) ? piece[0] : "";
}

function xiangqiType(piece) {
  return xiangqiPieceValid(piece) ? piece[1] : "";
}

function xiangqiPieceName(piece) {
  return {
    rK: "帅",
    rA: "仕",
    rB: "相",
    rN: "马",
    rR: "车",
    rC: "炮",
    rP: "兵",
    bK: "将",
    bA: "士",
    bB: "象",
    bN: "马",
    bR: "车",
    bC: "炮",
    bP: "卒",
  }[piece] || "";
}

function xiangqiCoord(index) {
  const row = Math.floor(index / XIANGQI_COLS) + 1;
  const col = (index % XIANGQI_COLS) + 1;
  return `${row}路${col}列`;
}

function xiangqiMoveText(move) {
  if (!move) return "";
  return `${xiangqiCoord(move.from)}至${xiangqiCoord(move.to)}`;
}

function setTouhuControl(field, value) {
  const miniGames = ensureMiniGames();
  const game = normalizeTouhuGame(miniGames.touhu);
  if (field === "aim") game.aim = clamp(Math.round(Number(value) || 50));
  if (field === "strength") game.strength = clamp(Math.round(Number(value) || 58));
  game.lastShot = null;
  miniGames.touhu = game;
  save();
  render();
}

function adjustTouhuGuide(action) {
  const miniGames = ensureMiniGames();
  const game = normalizeTouhuGame(miniGames.touhu);
  game.guide = normalizeTouhuGuide(game.guide);
  if (action === "toggle") {
    game.guide.visible = !game.guide.visible;
  } else if (action === "calibrate") {
    game.guide.visible = true;
    game.guide.aim = game.aim;
    game.guide.strength = game.strength;
    game.message = "已把红绿参考线校准到当前手感。";
  } else if (action === "reset") {
    game.guide = { visible: true, aim: 50, strength: 62 };
    game.message = "参考线已回到默认位置。";
  }
  miniGames.touhu = game;
  save();
  render();
}

function throwTouhuArrow() {
  if (!state || state.dead || state.prisonYears > 0) return;
  const miniGames = ensureMiniGames();
  const game = normalizeTouhuGame(miniGames.touhu);
  if (game.finished || game.arrowsLeft <= 0) return;

  const drift = game.wind * 0.82 + randInt(-7, 7);
  const aimError = Math.abs(game.aim - 50 + drift);
  const strengthError = Math.abs(game.strength - 62 + randInt(-5, 5));
  const score = Math.max(0, Math.round(100 - aimError * 2.25 - strengthError * 1.55));
  const hit = score >= 72;
  const quality = score >= 92 ? "贯耳" : hit ? "入壶" : score >= 58 ? "擦壶" : "落空";
  game.arrowsLeft -= 1;
  if (hit) game.hits += 1;
  const shot = { aim: game.aim, strength: game.strength, wind: game.wind, score, hit, quality };
  game.lastShot = shot;
  game.throws.unshift(shot);
  game.message = hit ? `一箭${quality}，席间喝彩。` : `${quality}，还差一点火候。`;
  if (game.arrowsLeft <= 0) {
    game.finished = true;
    finishTouhuGame(game);
  } else {
    game.wind = randInt(-16, 16);
    miniGames.touhu = game;
    save();
    render();
  }
}

function finishTouhuGame(game) {
  const miniGames = ensureMiniGames();
  miniGames.touhu = game;
  miniGames.record.touhuBest = Math.max(miniGames.record.touhuBest, game.hits);
  const deltas = [];
  let title = "投壶";
  let text = `五矢投毕，中了 ${game.hits} 矢。`;
  if (game.hits >= 4) {
    const prize = randInt(18, 48);
    changeStat("mood", randInt(4, 8), deltas);
    changeStat("eq", randInt(1, 3), deltas);
    changeStat("favorability", 1, deltas);
    changeStat("money", prize, deltas);
    addLedger("投壶彩头", prize, "雅戏席上投壶得彩。");
    title = "投壶得彩";
    text = `你五矢中 ${game.hits}，准头惊人，赢得 ${moneyText(prize)} 彩头。`;
  } else if (game.hits >= 2) {
    changeStat("mood", randInt(2, 5), deltas);
    changeStat("eq", 1, deltas);
    text = `你五矢中 ${game.hits}，虽非头名，也算投得漂亮。`;
  } else {
    changeStat("mood", randInt(-2, 0), deltas);
    changeStat("eq", 1, deltas);
    text = `你五矢仅中 ${game.hits}，旁人笑说风太急，改日再来。`;
  }
  state.lastDeltas = deltas;
  addLog(title, text, deltas);
  save();
  render();
}

function resetTouhuGame() {
  const miniGames = ensureMiniGames();
  miniGames.touhu = createTouhuGame();
  miniGames.tab = "touhu";
  save();
  render();
}

function setGambleStake(amount) {
  state.gamble = normalizeGamble(state.gamble);
  const mode = state.gamble.mode === "bigSmall" ? "bigSmall" : state.gamble.mode === "paiGow" ? "paiGow" : "call";
  if (mode === "bigSmall" ? state.gamble.bigSmall?.revealed : mode === "paiGow" ? state.gamble.paiGow?.revealed : state.gamble.revealed) return;
  const moneyCap = Math.max(GAMBLE_MIN_STAKE, Math.round(state.stats.money || 0));
  state.gamble.stake = Math.max(GAMBLE_MIN_STAKE, Math.min(moneyCap, Math.round(Number(amount) || 50)));
  if (state.gamble.guess) state.gamble.guess.stake = state.gamble.stake;
  if (state.gamble.paiGow) state.gamble.paiGow.stake = state.gamble.stake;
  if (state.gamble.bigSmall) state.gamble.bigSmall.stake = state.gamble.stake;
  save();
  render();
}

function normalizeGambleDice(dice) {
  return Array.isArray(dice) && dice.length === GAMBLE_DICE_COUNT ? dice.map((item) => clamp(Math.round(Number(item) || 1), 1, 6)) : rollGambleDice();
}

function normalizeGambleBid(bid) {
  if (!bid || typeof bid !== "object") return null;
  const count = Math.round(Number(bid.count) || 0);
  const face = Math.round(Number(bid.face) || 0);
  if (count < 1 || count > GAMBLE_TOTAL_DICE || face < 1 || face > 6) return null;
  return { count, face };
}

function rollGambleDice() {
  return Array.from({ length: GAMBLE_DICE_COUNT }, () => randInt(1, 6));
}

function rollGuessDice() {
  return Array.from({ length: GUESS_DICE_COUNT }, () => randInt(1, 6));
}

function normalizeGuessDice(dice) {
  return Array.isArray(dice) && dice.length === GUESS_DICE_COUNT ? dice.map((item) => clamp(Math.round(Number(item) || 1), 1, 6)) : rollGuessDice();
}

function guessKind(id) {
  return GUESS_KIND_OPTIONS.find((item) => item.id === id) || null;
}

function createGuessDiceRound(stake = 50) {
  return {
    stake: Math.max(GAMBLE_MIN_STAKE, Math.round(Number(stake) || 50)),
    dice: rollGuessDice(),
    kind: "size",
    choice: "big",
    rounds: 1,
    revealed: false,
    history: [],
    result: { speaker: "博坊", text: "选好押法和赌局数，再掷骰开局。" },
  };
}

function normalizeGuessDiceGame(game, stake = 50) {
  const source = game && typeof game === "object" ? game : {};
  const kind = guessKind(source.kind) ? source.kind : "size";
  const rounds = GUESS_ROUND_OPTIONS.includes(Number(source.rounds)) ? Number(source.rounds) : 1;
  return {
    stake: Math.max(GAMBLE_MIN_STAKE, Math.round(Number(source.stake || stake) || 50)),
    dice: normalizeGuessDice(source.dice),
    kind,
    choice: normalizeGuessChoice(kind, source.choice),
    rounds,
    revealed: !!source.revealed,
    history: Array.isArray(source.history) ? source.history.slice(0, 12) : [],
    result: source.result || { speaker: "博坊", text: "选好押法和赌局数，再掷骰开局。" },
  };
}

function normalizeGuessChoice(kind, choice) {
  if (kind === "sum") return clamp(Math.round(Number(choice) || 10), 3, 18);
  if (kind === "triple") return clamp(Math.round(Number(choice) || 1), 1, 6);
  return ["big", "small", "same"].includes(choice) ? choice : "big";
}

function guessDiceOutcome(dice) {
  const points = normalizeGuessDice(dice);
  const sum = points.reduce((total, point) => total + point, 0);
  const same = points.every((point) => point === points[0]);
  const size = same ? "same" : sum >= 11 ? "big" : "small";
  return { dice: points, sum, same, size };
}

function guessChoiceLabel(kind, choice) {
  if (kind === "sum") return `${choice} 点`;
  if (kind === "triple") return `${CHINESE_NUMS[choice] || choice} 豹子`;
  return ({ big: "大", small: "小", same: "豹子" })[choice] || "大";
}

function guessPayout(kind, choice, outcome, stake) {
  if (kind === "size") {
    const win = choice === outcome.size;
    const multiplier = choice === "same" ? 5 : 1;
    return win ? stake * multiplier : -stake;
  }
  if (kind === "triple") {
    const win = outcome.same && outcome.dice[0] === Number(choice);
    return win ? stake * 12 : -stake;
  }
  const win = outcome.sum === Number(choice);
  const distance = Math.abs(Number(choice) - 10.5);
  const multiplier = distance >= 5.5 ? 8 : distance >= 3.5 ? 5 : 3;
  return win ? stake * multiplier : -stake;
}

function chooseGuessKind(kind) {
  if (!state || state.dead || state.prisonYears > 0 || state.age < 15) return;
  state.gamble = normalizeGamble(state.gamble);
  const game = normalizeGuessDiceGame(state.gamble.guess, state.gamble.stake);
  if (game.revealed || !guessKind(kind)) return;
  game.kind = kind;
  game.choice = normalizeGuessChoice(kind, kind === "sum" ? 10 : kind === "triple" ? 1 : "big");
  game.result = { speaker: "博坊", text: `已改为${guessKind(kind).label}。` };
  state.gamble.mode = "guess";
  state.gamble.guess = game;
  save();
  render();
}

function chooseGuessValue(value) {
  if (!state || state.dead || state.prisonYears > 0 || state.age < 15) return;
  state.gamble = normalizeGamble(state.gamble);
  const game = normalizeGuessDiceGame(state.gamble.guess, state.gamble.stake);
  if (game.revealed) return;
  game.choice = normalizeGuessChoice(game.kind, value);
  game.result = { speaker: "你", text: `你押了${guessChoiceLabel(game.kind, game.choice)}。` };
  state.gamble.mode = "guess";
  state.gamble.guess = game;
  save();
  render();
}

function setGuessRounds(rounds) {
  if (!state || state.dead || state.prisonYears > 0 || state.age < 15) return;
  state.gamble = normalizeGamble(state.gamble);
  const game = normalizeGuessDiceGame(state.gamble.guess, state.gamble.stake);
  if (game.revealed) return;
  game.rounds = GUESS_ROUND_OPTIONS.includes(Number(rounds)) ? Number(rounds) : 1;
  game.result = { speaker: "博坊", text: `本次连开 ${game.rounds} 局。` };
  state.gamble.mode = "guess";
  state.gamble.guess = game;
  save();
  render();
}

function revealGuessDice() {
  if (!state || state.dead || state.prisonYears > 0 || state.age < 15) return;
  state.gamble = normalizeGamble(state.gamble);
  const money = Math.round(state.stats.money || 0);
  if (money < GAMBLE_MIN_STAKE) return;
  const game = normalizeGuessDiceGame(state.gamble.guess, state.gamble.stake);
  if (game.revealed) return;
  const stake = Math.max(GAMBLE_MIN_STAKE, Math.min(Math.round(state.gamble.stake || game.stake || 50), Math.max(GAMBLE_MIN_STAKE, money)));
  const rounds = Math.min(game.rounds, Math.max(1, Math.floor(money / stake)));
  const history = [];
  let total = 0;
  for (let index = 0; index < rounds; index += 1) {
    const dice = rollGuessDice();
    const outcome = guessDiceOutcome(dice);
    const amount = guessPayout(game.kind, game.choice, outcome, stake);
    total += amount;
    history.push({ dice, sum: outcome.sum, size: outcome.size, amount });
  }
  const deltas = [];
  changeStat("money", total, deltas);
  changeStat("mood", total >= 0 ? randInt(2, 6) : -randInt(2, 6), deltas);
  if (total < 0 && Math.random() > 0.7) changeStat("virtue", -1, deltas);
  const last = history[history.length - 1];
  game.stake = stake;
  game.rounds = rounds;
  game.dice = last?.dice || game.dice;
  game.history = history;
  game.revealed = true;
  game.result = {
    speaker: "开局",
    text: `连开 ${rounds} 局，押${guessChoiceLabel(game.kind, game.choice)}，合计${total >= 0 ? "赢下" : "输掉"} ${moneyText(Math.abs(total))}。`,
    amount: total,
    history,
  };
  state.gamble.mode = "guess";
  state.gamble.guess = game;
  state.gamble.stake = stake;
  state.lastDeltas = deltas;
  addLedger("博坊猜骰", total, `下注 ${moneyText(stake)}，${rounds} 局，押${guessChoiceLabel(game.kind, game.choice)}。`);
  addLog("博坊猜骰", game.result.text, deltas);
  save();
  render();
}

function newGuessDiceRound() {
  if (!state || state.dead || state.prisonYears > 0 || state.age < 15) return;
  state.gamble = normalizeGamble(state.gamble);
  state.gamble.mode = "guess";
  state.gamble.guess = createGuessDiceRound(state.gamble?.stake || 50);
  save();
  render();
}

function paiGowDeck() {
  return PAI_GOW_TILES.map((tile) => ({ ...tile, pips: [...tile.pips] }));
}

function dealPaiGowTiles() {
  const deck = shuffle(paiGowDeck());
  return { playerTiles: deck.slice(0, 4), bankerTiles: deck.slice(4, 8) };
}

function createPaiGowRound(stake = 50) {
  const deal = dealPaiGowTiles();
  return {
    stake: Math.max(GAMBLE_MIN_STAKE, Math.round(Number(stake) || 50)),
    playerTiles: deal.playerTiles,
    bankerTiles: deal.bankerTiles,
    hands: { front: [], back: [] },
    selected: null,
    revealed: false,
    result: { speaker: "牌九", text: "拖动或点选骨牌，把四张牌分成前手、后手。两手皆胜庄家即全赢，一胜一负为和，同牌庄吃和。" },
  };
}

function normalizePaiGowTile(tile, fallbackIndex = 0) {
  const fallback = PAI_GOW_TILES[fallbackIndex % PAI_GOW_TILES.length];
  if (!tile || typeof tile !== "object") return { ...fallback, pips: [...fallback.pips] };
  const pips = Array.isArray(tile.pips) && tile.pips.length === 2
    ? tile.pips.map((pip) => clamp(Math.round(Number(pip) || 1), 1, 6))
    : [...fallback.pips];
  return {
    id: typeof tile.id === "string" ? tile.id : fallback.id,
    name: typeof tile.name === "string" && tile.name ? tile.name : fallback.name,
    pips,
    order: Math.max(1, Math.round(Number(tile.order) || fallback.order || 1)),
  };
}

function normalizePaiGowHands(hands) {
  const source = hands && typeof hands === "object" ? hands : {};
  const normalized = { front: [], back: [] };
  const used = new Set();
  for (const group of PAI_GOW_GROUPS) {
    const list = Array.isArray(source[group.id]) ? source[group.id] : [];
    for (const raw of list) {
      const index = Math.round(Number(raw));
      if (index >= 0 && index < 4 && !used.has(index) && normalized[group.id].length < 2) {
        normalized[group.id].push(index);
        used.add(index);
      }
    }
  }
  return normalized;
}

function normalizePaiGowGame(game, stake = 50) {
  const fresh = createPaiGowRound(stake);
  const source = game && typeof game === "object" ? game : {};
  const playerTiles = Array.isArray(source.playerTiles) && source.playerTiles.length === 4
    ? source.playerTiles.map((tile, index) => normalizePaiGowTile(tile, index))
    : fresh.playerTiles;
  const bankerTiles = Array.isArray(source.bankerTiles) && source.bankerTiles.length === 4
    ? source.bankerTiles.map((tile, index) => normalizePaiGowTile(tile, index + 4))
    : fresh.bankerTiles;
  const selected = Number.isInteger(Number(source.selected)) && Number(source.selected) >= 0 && Number(source.selected) < 4 ? Number(source.selected) : null;
  return {
    stake: Math.max(GAMBLE_MIN_STAKE, Math.round(Number(source.stake || stake) || 50)),
    playerTiles,
    bankerTiles,
    hands: normalizePaiGowHands(source.hands),
    selected,
    revealed: !!source.revealed,
    result: source.result || { speaker: "牌九", text: "拖动或点选骨牌，把四张牌分成前手、后手。两手皆胜庄家即全赢，一胜一负为和，同牌庄吃和。" },
  };
}

function paiGowAssignedIndexes(game) {
  return new Set([...(game.hands?.front || []), ...(game.hands?.back || [])]);
}

function paiGowHandsComplete(game) {
  return (game.hands?.front || []).length === 2 && (game.hands?.back || []).length === 2;
}

function paiGowHandScore(tiles) {
  const names = (tiles || []).map((tile) => tile.name);
  const has = (name) => names.includes(name);
  const pipTotal = (tiles || []).reduce((total, tile) => total + tile.pips.reduce((sum, pip) => sum + pip, 0), 0);
  const point = pipTotal % 10 || 10;
  const kicker = (tiles || []).reduce((total, tile) => total + (tile.order || 0), 0);
  if (has("天") && has("九")) return { label: "天九", rank: 120, point, kicker, kind: "special" };
  if (has("地") && has("八")) return { label: "地八", rank: 114, point, kicker, kind: "special" };
  if (has("人") && has("七")) return { label: "人七", rank: 108, point, kicker, kind: "special" };
  if (tiles?.length === 2 && tiles[0].name === tiles[1].name) {
    return { label: `${tiles[0].name}对`, rank: 70 + (tiles[0].order || 0), point, kicker, kind: "pair" };
  }
  return { label: `${CHINESE_NUMS[point] || point}点`, rank: point, point, kicker, kind: "point" };
}

function comparePaiGowScore(player, banker) {
  if (player.rank !== banker.rank) return player.rank > banker.rank ? 1 : -1;
  if (player.kicker !== banker.kicker) return player.kicker > banker.kicker ? 1 : -1;
  return -1;
}

function paiGowHandsFromIndexes(tiles, hands) {
  return PAI_GOW_GROUPS.map((group) => {
    const indexes = (hands?.[group.id] || []).slice(0, 2);
    const handTiles = indexes.map((index) => tiles[index]).filter(Boolean);
    return {
      group: group.id,
      label: group.label,
      indexes,
      tiles: handTiles,
      score: handTiles.length === 2 ? paiGowHandScore(handTiles) : null,
    };
  });
}

function paiGowSplitHands(tiles, split) {
  const hands = {
    front: split.groups[0].slice(0, 2),
    back: split.groups[1].slice(0, 2),
  };
  return paiGowHandsFromIndexes(tiles, hands);
}

function bestPaiGowSplit(tiles) {
  return PAI_GOW_AUTO_SPLITS.map((split) => {
    const hands = paiGowSplitHands(tiles, split);
    return { split, hands };
  }).sort((left, right) => {
    const leftLow = Math.min(left.hands[0].score.rank, left.hands[1].score.rank);
    const rightLow = Math.min(right.hands[0].score.rank, right.hands[1].score.rank);
    if (rightLow !== leftLow) return rightLow - leftLow;
    const leftHigh = Math.max(left.hands[0].score.rank, left.hands[1].score.rank);
    const rightHigh = Math.max(right.hands[0].score.rank, right.hands[1].score.rank);
    return rightHigh - leftHigh;
  })[0];
}

function paiGowAutoSplitHands(splitId) {
  const split = PAI_GOW_AUTO_SPLITS.find((item) => item.id === splitId) || PAI_GOW_AUTO_SPLITS[0];
  return { front: split.groups[0].slice(0, 2), back: split.groups[1].slice(0, 2) };
}

function selectPaiGowTile(index) {
  if (!state || state.dead || state.prisonYears > 0 || state.age < 15) return;
  state.gamble = normalizeGamble(state.gamble);
  const game = normalizePaiGowGame(state.gamble.paiGow, state.gamble.stake);
  if (game.revealed) return;
  const tileIndex = Math.round(Number(index));
  if (tileIndex < 0 || tileIndex >= game.playerTiles.length) return;
  game.selected = game.selected === tileIndex ? null : tileIndex;
  game.result = game.selected === null
    ? { speaker: "牌九", text: "已取消选牌。" }
    : { speaker: "我方", text: `选中${game.playerTiles[tileIndex].name}牌，点前手或后手即可放入。` };
  state.gamble.mode = "paiGow";
  state.gamble.paiGow = game;
  save();
  render();
}

function movePaiGowTile(index, groupId) {
  if (!state || state.dead || state.prisonYears > 0 || state.age < 15) return;
  state.gamble = normalizeGamble(state.gamble);
  const game = normalizePaiGowGame(state.gamble.paiGow, state.gamble.stake);
  if (game.revealed) return;
  const tileIndex = Math.round(Number(index));
  if (tileIndex < 0 || tileIndex >= game.playerTiles.length) return;
  const target = groupId === "front" || groupId === "back" ? groupId : "pool";
  for (const group of PAI_GOW_GROUPS) {
    game.hands[group.id] = (game.hands[group.id] || []).filter((item) => item !== tileIndex);
  }
  if (target !== "pool") {
    if ((game.hands[target] || []).length >= 2) {
      game.selected = tileIndex;
      game.result = { speaker: "牌九", text: `${PAI_GOW_GROUPS.find((group) => group.id === target)?.label || "这一手"}已经满两张了，先挪出一张。` };
      state.gamble.mode = "paiGow";
      state.gamble.paiGow = game;
      save();
      render();
      return;
    }
    game.hands[target].push(tileIndex);
  }
  game.selected = null;
  game.result = paiGowHandsComplete(game)
    ? { speaker: "牌九", text: "两手已分好，可以开牌。" }
    : { speaker: "牌九", text: "继续分牌：前手、后手各需两张。" };
  state.gamble.mode = "paiGow";
  state.gamble.paiGow = game;
  save();
  render();
}

function placePaiGowSelected(groupId) {
  if (!state || state.dead || state.prisonYears > 0 || state.age < 15) return;
  state.gamble = normalizeGamble(state.gamble);
  const game = normalizePaiGowGame(state.gamble.paiGow, state.gamble.stake);
  if (game.selected === null || game.selected === undefined) {
    game.result = { speaker: "牌九", text: "先点中一张我方骨牌，再放入前手或后手。" };
    state.gamble.mode = "paiGow";
    state.gamble.paiGow = game;
    save();
    render();
    return;
  }
  movePaiGowTile(game.selected, groupId);
}

function autoPaiGowSplit(splitId) {
  if (!state || state.dead || state.prisonYears > 0 || state.age < 15) return;
  state.gamble = normalizeGamble(state.gamble);
  const game = normalizePaiGowGame(state.gamble.paiGow, state.gamble.stake);
  if (game.revealed) return;
  const split = PAI_GOW_AUTO_SPLITS.find((item) => item.id === splitId) || PAI_GOW_AUTO_SPLITS[0];
  game.hands = paiGowAutoSplitHands(split.id);
  game.selected = null;
  game.result = { speaker: "牌九", text: `已按“${split.label}”分好牌，可直接开牌，也可拖牌调整。` };
  state.gamble.mode = "paiGow";
  state.gamble.paiGow = game;
  save();
  render();
}

function clearPaiGowHands() {
  if (!state || state.dead || state.prisonYears > 0 || state.age < 15) return;
  state.gamble = normalizeGamble(state.gamble);
  const game = normalizePaiGowGame(state.gamble.paiGow, state.gamble.stake);
  if (game.revealed) return;
  game.hands = { front: [], back: [] };
  game.selected = null;
  game.result = { speaker: "牌九", text: "已收回骨牌，重新分前后两手。" };
  state.gamble.mode = "paiGow";
  state.gamble.paiGow = game;
  save();
  render();
}

function revealPaiGow() {
  if (!state || state.dead || state.prisonYears > 0 || state.age < 15) return;
  state.gamble = normalizeGamble(state.gamble);
  const money = Math.round(state.stats.money || 0);
  if (money < GAMBLE_MIN_STAKE) return;
  const game = normalizePaiGowGame(state.gamble.paiGow, state.gamble.stake);
  if (game.revealed) return;
  if (!paiGowHandsComplete(game)) {
    game.result = { speaker: "牌九", text: "前手、后手都要放满两张骨牌，才能开牌。" };
    state.gamble.mode = "paiGow";
    state.gamble.paiGow = game;
    save();
    render();
    return;
  }
  const stake = Math.max(GAMBLE_MIN_STAKE, Math.min(Math.round(state.gamble.stake || game.stake || 50), Math.max(GAMBLE_MIN_STAKE, money)));
  const playerHands = paiGowHandsFromIndexes(game.playerTiles, game.hands);
  const banker = bestPaiGowSplit(game.bankerTiles);
  const comparisons = playerHands.map((hand, index) => {
    const bankerHand = banker.hands[index];
    const result = comparePaiGowScore(hand.score, bankerHand.score);
    return { group: hand.group, label: hand.label, result, player: hand.score, banker: bankerHand.score };
  });
  const wins = comparisons.filter((item) => item.result > 0).length;
  const losses = comparisons.filter((item) => item.result < 0).length;
  const rareHands = playerHands.filter((hand) => hand.score.kind === "special" || hand.score.kind === "pair").length;
  const multiplier = wins === 2 && rareHands >= 2 ? 2 : 1;
  const amount = wins === 2 ? stake * multiplier : losses === 2 ? -stake : 0;
  const outcome = amount > 0 ? "全赢" : amount < 0 ? "全输" : "和局";
  const deltas = [];
  if (amount !== 0) changeStat("money", amount, deltas);
  changeStat("mood", amount > 0 ? randInt(3, 7) : amount < 0 ? -randInt(2, 6) : randInt(0, 2), deltas);
  if (amount < 0 && Math.random() > 0.74) changeStat("virtue", -1, deltas);
  if (amount > 0 && multiplier > 1) changeStat("favorability", 1, deltas);
  const summary = comparisons.map((item) => `${item.label}${item.result > 0 ? "胜" : "负"}`).join("、");
  game.stake = stake;
  game.revealed = true;
  game.selected = null;
  game.result = {
    speaker: "开牌",
    text: `${summary}，${outcome}${amount ? `，${amount > 0 ? "赢下" : "输掉"} ${moneyText(Math.abs(amount))}` : ""}。${multiplier > 1 ? "双手成牌，赔率加倍。" : ""}`,
    amount,
    outcome,
    multiplier,
    comparisons,
    playerHands,
    bankerHands: banker.hands,
    bankerSplit: banker.split.label,
  };
  state.gamble.mode = "paiGow";
  state.gamble.paiGow = game;
  state.gamble.stake = stake;
  state.lastDeltas = deltas;
  addLedger("博坊牌九", amount, `下注 ${moneyText(stake)}，${outcome}。`);
  addLog("博坊牌九", game.result.text, deltas);
  save();
  render();
}

function newPaiGowRound() {
  if (!state || state.dead || state.prisonYears > 0 || state.age < 15) return;
  state.gamble = normalizeGamble(state.gamble);
  state.gamble.mode = "paiGow";
  state.gamble.paiGow = createPaiGowRound(state.gamble?.stake || 50);
  save();
  render();
}

function rollBigSmallDice() {
  return Array.from({ length: BIG_SMALL_DICE_COUNT }, () => randInt(1, 6));
}

function normalizeBigSmallDice(dice) {
  return Array.isArray(dice) && dice.length === BIG_SMALL_DICE_COUNT ? dice.map((item) => clamp(Math.round(Number(item) || 1), 1, 6)) : rollBigSmallDice();
}

function bigSmallChoice(id) {
  return BIG_SMALL_CHOICES.find((item) => item.id === id) || null;
}

function createBigSmallRound(stake = 50) {
  return {
    stake: Math.max(GAMBLE_MIN_STAKE, Math.round(Number(stake) || 50)),
    dice: rollBigSmallDice(),
    choice: "big",
    revealed: false,
    result: { speaker: "博坊", text: "先押大、小或豹子，再开盅见分晓。" },
  };
}

function normalizeBigSmallGame(game, stake = 50) {
  const source = game && typeof game === "object" ? game : {};
  const choice = bigSmallChoice(source.choice) ? source.choice : "big";
  return {
    stake: Math.max(GAMBLE_MIN_STAKE, Math.round(Number(source.stake || stake) || 50)),
    dice: normalizeBigSmallDice(source.dice),
    choice,
    revealed: !!source.revealed,
    result: source.result || { speaker: "博坊", text: "先押大、小或豹子，再开盅见分晓。" },
  };
}

function bigSmallOutcome(dice) {
  const points = normalizeBigSmallDice(dice);
  const sum = points.reduce((total, point) => total + point, 0);
  const same = points.every((point) => point === points[0]);
  if (same) return { id: "same", label: "豹子", sum };
  return sum >= 11 ? { id: "big", label: "大", sum } : { id: "small", label: "小", sum };
}

function setGambleMode(mode) {
  if (!state || state.dead || state.prisonYears > 0 || state.age < 15) return;
  state.gamble = normalizeGamble(state.gamble);
  state.gamble.mode = ["call", "paiGow", "bigSmall"].includes(mode) ? mode : "call";
  save();
  render();
}

function chooseBigSmall(choice) {
  if (!state || state.dead || state.prisonYears > 0 || state.age < 15) return;
  state.gamble = normalizeGamble(state.gamble);
  const game = normalizeBigSmallGame(state.gamble.bigSmall, state.gamble.stake);
  if (game.revealed || !bigSmallChoice(choice)) return;
  game.choice = choice;
  game.result = { speaker: "你", text: `你押了${bigSmallChoice(choice).label}，可以开盅了。` };
  state.gamble.mode = "bigSmall";
  state.gamble.bigSmall = game;
  save();
  render();
}

function revealBigSmall() {
  if (!state || state.dead || state.prisonYears > 0 || state.age < 15) return;
  state.gamble = normalizeGamble(state.gamble);
  const money = Math.round(state.stats.money || 0);
  if (money < GAMBLE_MIN_STAKE) return;
  const game = normalizeBigSmallGame(state.gamble.bigSmall, state.gamble.stake);
  if (game.revealed) return;
  const stake = Math.max(GAMBLE_MIN_STAKE, Math.min(Math.round(state.gamble.stake || game.stake || 50), Math.max(GAMBLE_MIN_STAKE, money)));
  const choice = bigSmallChoice(game.choice) || BIG_SMALL_CHOICES[0];
  const outcome = bigSmallOutcome(game.dice);
  const playerWin = choice.id === outcome.id;
  const amount = playerWin ? stake * choice.multiplier : -stake;
  const deltas = [];
  changeStat("money", amount, deltas);
  changeStat("mood", playerWin ? randInt(2, 6) : -randInt(2, 6), deltas);
  if (!playerWin && Math.random() > 0.72) changeStat("virtue", -1, deltas);
  game.stake = stake;
  game.revealed = true;
  game.result = {
    speaker: "开盅",
    text: `三骰共 ${outcome.sum} 点，结果为${outcome.label}。你押${choice.label}${playerWin ? `赢下 ${moneyText(Math.abs(amount))}` : `输掉 ${moneyText(stake)}`}。`,
    playerWin,
    amount,
    outcome,
  };
  state.gamble.mode = "bigSmall";
  state.gamble.bigSmall = game;
  state.gamble.stake = stake;
  state.lastDeltas = deltas;
  addLedger("博坊赌大小", amount, `下注 ${moneyText(stake)}，押${choice.label}，开出${outcome.sum}点${outcome.label}。`);
  addLog("博坊赌大小", game.result.text, deltas);
  save();
  render();
}

function newBigSmallRound() {
  if (!state || state.dead || state.prisonYears > 0 || state.age < 15) return;
  state.gamble = normalizeGamble(state.gamble);
  state.gamble.mode = "bigSmall";
  state.gamble.bigSmall = createBigSmallRound(state.gamble?.stake || 50);
  save();
  render();
}

function createGambleRound(stake = state?.gamble?.stake || 50) {
  const currentBid = null;
  const draftBid = nextGambleBid(currentBid);
  const turn = Math.random() > 0.5 ? "player" : "opponent";
  const normalizedStake = Math.max(GAMBLE_MIN_STAKE, Math.round(Number(stake) || 50));
  return {
    mode: "call",
    stake: normalizedStake,
    playerDice: rollGambleDice(),
    opponentDice: rollGambleDice(),
    currentBid,
    draftBid,
    turn,
    lastBidder: "",
    revealed: false,
    result: { speaker: "博坊", text: turn === "player" ? "你先手，请叫点。" : "对方先手，等对方叫点。" },
    opponentName: makePersonName("male"),
    opponentItem: sample(GAMBLE_OPPONENT_ITEMS) || "一匣银锭",
    guess: createGuessDiceRound(normalizedStake),
    paiGow: createPaiGowRound(normalizedStake),
    bigSmall: createBigSmallRound(normalizedStake),
  };
}

function nextGambleBid(bid) {
  if (!bid) return { count: 1, face: 1 };
  if (bid.face < 6) return { count: bid.count, face: bid.face + 1 };
  return { count: Math.min(GAMBLE_TOTAL_DICE, bid.count + 1), face: 1 };
}

function isGambleBidLegal(next, current) {
  if (!next || next.count < 1 || next.count > GAMBLE_TOTAL_DICE || next.face < 1 || next.face > 6) return false;
  if (!current) return true;
  return next.count > current.count || (next.count === current.count && next.face > current.face);
}

function gambleBidText(bid) {
  return bid ? `${CHINESE_NUMS[bid.count] || bid.count}个${CHINESE_NUMS[bid.face] || bid.face}` : "尚未叫点";
}

function gambleFaceCount(face) {
  const point = Math.max(1, Math.min(6, Number(face) || 1));
  const dice = [...(state.gamble?.playerDice || []), ...(state.gamble?.opponentDice || [])];
  return dice.filter((item) => item === point || (point !== 1 && item === 1)).length;
}

function setGambleDraft(field, delta) {
  if (!state || state.dead || state.prisonYears > 0 || state.age < 15) return;
  state.gamble ||= createGambleRound();
  if (state.gamble.revealed || state.gamble.turn !== "player") return;
  const current = state.gamble.currentBid;
  const draft = normalizeGambleBid(state.gamble.draftBid) || nextGambleBid(current);
  if (field === "face") draft.face = clamp(draft.face + Number(delta || 0), 1, 6);
  if (field === "count") draft.count = clamp(draft.count + Number(delta || 0), 1, GAMBLE_TOTAL_DICE);
  state.gamble.draftBid = isGambleBidLegal(draft, current) ? draft : nextGambleBid(current);
  save();
  render();
}

function chooseGambleFace(face) {
  if (!state || state.dead || state.prisonYears > 0 || state.age < 15) return;
  state.gamble ||= createGambleRound();
  if (state.gamble.revealed || state.gamble.turn !== "player") return;
  const current = state.gamble.currentBid;
  const draft = normalizeGambleBid(state.gamble.draftBid) || nextGambleBid(current);
  draft.face = clamp(Math.round(Number(face) || 1), 1, 6);
  state.gamble.draftBid = isGambleBidLegal(draft, current) ? draft : nextGambleBid(current);
  save();
  render();
}

function confirmGambleBid() {
  if (!state || state.dead || state.prisonYears > 0 || state.age < 15) return;
  const money = Math.round(state.stats.money || 0);
  if (money < GAMBLE_MIN_STAKE) return;
  state.gamble ||= createGambleRound();
  if (state.gamble.revealed || state.gamble.turn !== "player") return;
  const bid = normalizeGambleBid(state.gamble.draftBid) || nextGambleBid(state.gamble.currentBid);
  if (!isGambleBidLegal(bid, state.gamble.currentBid)) return;
  state.gamble.currentBid = bid;
  state.gamble.lastBidder = "player";
  state.gamble.turn = "opponent";
  state.gamble.result = { speaker: "你", text: `你叫了${gambleBidText(bid)}，等对方应声。` };
  save();
  render();
}

function opponentGambleTurn() {
  if (!state || state.dead || state.prisonYears > 0 || state.age < 15) return;
  state.gamble ||= createGambleRound();
  if (state.gamble.revealed || state.gamble.turn !== "opponent") return;
  const current = normalizeGambleBid(state.gamble?.currentBid);
  if (!current) {
    const firstBid = chooseOpponentBid(null);
    state.gamble.currentBid = firstBid;
    state.gamble.lastBidder = "opponent";
    state.gamble.turn = "player";
    state.gamble.draftBid = nextGambleBid(firstBid);
    state.gamble.result = { speaker: "对方", text: `${state.gamble.opponentName}先喊了${gambleBidText(firstBid)}，轮到你。` };
    save();
    render();
    return;
  }
  const total = gambleFaceCount(current.face);
  const doubt = state.gamble.lastBidder === "player" && (current.count > total + randInt(0, 2) || current.count >= GAMBLE_TOTAL_DICE || Math.random() < 0.18 + Math.max(0, current.count - total) * 0.08);
  if (doubt) {
    revealGamble("opponent");
    return;
  }
  const raiseCount = chooseOpponentBid(current);
  state.gamble.currentBid = raiseCount;
  state.gamble.lastBidder = "opponent";
  state.gamble.turn = "player";
  state.gamble.draftBid = nextGambleBid(state.gamble.currentBid);
  state.gamble.result = { speaker: "对方", text: `${state.gamble.opponentName}跟着叫了${gambleBidText(state.gamble.currentBid)}，轮到你。` };
  save();
  render();
}

function chooseOpponentBid(current) {
  const minimum = nextGambleBid(current);
  const counts = [1, 2, 3, 4, 5, 6].map((face) => ({ face, count: gambleFaceCount(face) }));
  const best = counts.sort((a, b) => b.count - a.count)[0];
  const cautious = Math.max(minimum.count, Math.min(GAMBLE_TOTAL_DICE, best.count + randInt(0, 1)));
  const candidate = Math.random() > 0.45 ? { count: cautious, face: best.face } : minimum;
  return isGambleBidLegal(candidate, current) ? candidate : minimum;
}

function revealGamble(opener = "player") {
  if (!state || state.dead || state.prisonYears > 0 || state.age < 15) return;
  state.gamble ||= createGambleRound();
  const bid = normalizeGambleBid(state.gamble.currentBid);
  if (!bid || state.gamble.revealed) return;
  if (opener === "player" && state.gamble.turn !== "player") return;
  if (opener === "opponent" && state.gamble.turn !== "opponent") return;
  const money = Math.round(state.stats.money || 0);
  const stake = Math.max(GAMBLE_MIN_STAKE, Math.min(Math.round(state.gamble.stake || 50), Math.max(GAMBLE_MIN_STAKE, money)));
  if (money < GAMBLE_MIN_STAKE) return;
  const actual = gambleFaceCount(bid.face);
  const bidTrue = actual >= bid.count;
  const playerWin = opener === "player" ? !bidTrue : bidTrue;
  const amount = playerWin ? stake : -stake;
  const deltas = [];
  changeStat("money", amount, deltas);
  changeStat("mood", playerWin ? randInt(2, 6) : -randInt(2, 6), deltas);
  if (!playerWin && Math.random() > 0.68) changeStat("virtue", -randInt(1, 2), deltas);
  state.gamble.revealed = true;
  state.gamble.turn = "";
  state.gamble.result = {
    speaker: opener === "player" ? "你" : "对方",
    text: `${opener === "player" ? "你" : state.gamble.opponentName}开盅。双方共有 ${actual} 个 ${bid.face} 点，${gambleBidText(bid)}${bidTrue ? "成立" : "不成立"}，你${playerWin ? "赢下" : "输掉"} ${moneyText(stake)}。`,
    playerWin,
    amount,
    actual,
  };
  state.lastDeltas = deltas;
  addLedger("博坊叫骰", amount, `下注 ${moneyText(stake)}，${gambleBidText(bid)}，实际 ${actual} 个 ${bid.face} 点。`);
  addLog("博坊叫骰", state.gamble.result.text, deltas);
  save();
  render();
}

function newGambleRound() {
  if (!state || state.dead || state.prisonYears > 0 || state.age < 15) return;
  state.gamble = createGambleRound(state.gamble?.stake || 50);
  save();
  render();
}

function startCourtesanContest(forceNew = false) {
  if (!state || state.dead || state.prisonYears > 0 || state.age < COURTESAN_MIN_AGE) return;
  if (state.courtesanContest && !forceNew) {
    view.page = "courtesanContest";
    save();
    render();
    return;
  }
  const contest = createCourtesanContest();
  const deltas = [];
  if (state.stats.money < contest.entranceCost) {
    return finishAction("囊中羞涩", `今晚佳丽竞选需入席钱 ${moneyText(contest.entranceCost)}，你盘缠不足，只得暂且作罢。`, [{ label: "钱财", value: "不足", negative: true }], "CashBox");
  }
  changeStat("money", -contest.entranceCost, deltas);
  changeStat("mood", randInt(1, 3), deltas);
  addLedger("佳丽竞选", -contest.entranceCost, "瓦舍风月入席钱。");
  state.courtesanContest = contest;
  state.lastDeltas = deltas;
  view.page = "courtesanContest";
  view.placeId = "theater";
  save();
  render();
}

function courtesanRoundScore(candidate, roundId, supported = false) {
  const audience = randInt(8, 24) + Math.floor(candidate.support / 4);
  let base = 0;
  let boost = 0;
  if (roundId === "talent") {
    base = Math.floor(candidate.talent * 0.5 + candidate.looks * 0.2);
    boost = Math.floor(((state.stats.knowledge || 0) + (state.stats.eq || 0)) / 18) + randInt(8, 18);
  } else if (roundId === "wit") {
    base = Math.floor(candidate.wit * 0.52 + candidate.virtue * 0.16);
    boost = Math.floor(((state.stats.eq || 0) + (state.stats.virtue || 0)) / 20) + randInt(8, 20);
  } else {
    base = Math.floor(candidate.affection * 0.34 + candidate.support * 0.5);
    boost = randInt(16, 32) + Math.floor(courtesanGiftCost() / 25);
  }
  return base + audience + (supported ? boost : 0);
}

function courtesanRoundLine(candidate, roundId, score) {
  const question = sample(COURTESAN_QUESTIONS);
  if (roundId === "talent") return `${candidate.name}献${candidate.specialty}，${candidate.specialtyText} 本轮得 ${score} 分。`;
  if (roundId === "wit") return `你以“${question}”问${candidate.name}，她应答得体，满座点头，本轮得 ${score} 分。`;
  return `你赠礼助兴，${candidate.name}含笑谢过，灯下声望又起，本轮得 ${score} 分。`;
}

function chooseCourtesanAction(candidateId, actionId) {
  const contest = normalizeCourtesanContest(state.courtesanContest);
  const round = COURTESAN_ROUNDS[contest?.round || 0];
  if (!contest || !round || actionId !== round.id) return;
  const target = contest.candidates.find((candidate) => candidate.id === candidateId);
  if (!target) return;
  const deltas = [];
  if (round.id === "gift") {
    const cost = contest.giftCost || courtesanGiftCost();
    if (state.stats.money < cost) {
      state.lastDeltas = [{ label: "钱财", value: "不足", negative: true }];
      return render();
    }
    changeStat("money", -cost, deltas);
    changeStat("relationship", randInt(1, 3), deltas);
    changeStat("virtue", -randInt(0, 2), deltas);
    addLedger("竞选赠礼", -cost, `赠礼支持${target.name}。`);
    target.affection = clampNumber(target.affection + randInt(8, 16), 0, 100, target.affection);
    target.support = clampNumber(target.support + randInt(10, 20), 0, 100, target.support);
  } else if (round.id === "talent") {
    changeStat("mood", randInt(2, 5), deltas);
    changeStat("knowledge", randInt(1, 3), deltas);
    target.affection = clampNumber(target.affection + randInt(3, 8), 0, 100, target.affection);
  } else if (round.id === "wit") {
    changeStat("eq", randInt(1, 4), deltas);
    changeStat("virtue", randInt(-1, 2), deltas);
    target.affection = clampNumber(target.affection + randInt(4, 9), 0, 100, target.affection);
  }
  let selectedLine = "";
  contest.candidates = contest.candidates.map((candidate) => {
    const supported = candidate.id === candidateId;
    const score = courtesanRoundScore(candidate, round.id, supported);
    const next = { ...candidate };
    next.score += score;
    next.roundScores = [...next.roundScores, { round: round.id, score, supported }];
    if (supported) selectedLine = courtesanRoundLine(next, round.id, score);
    return next;
  });
  contest.round += 1;
  contest.log = [...contest.log, selectedLine].slice(-8);
  state.courtesanContest = normalizeCourtesanContest(contest);
  state.lastDeltas = deltas;
  save();
  render();
}

function finishCourtesanContest() {
  const contest = normalizeCourtesanContest(state.courtesanContest);
  if (!contest || contest.round < COURTESAN_ROUNDS.length) return;
  const ranking = [...contest.candidates].sort((a, b) => b.score - a.score);
  const winner = ranking[0];
  const deltas = [];
  changeStat("mood", randInt(4, 10), deltas);
  changeStat("eq", randInt(1, 4), deltas);
  changeStat("relationship", randInt(3, 8), deltas);
  if (winner.score >= 250) changeStat("favorability", randInt(1, 4), deltas);
  if (Math.random() > 0.74) changeStat("virtue", -randInt(1, 3), deltas);
  let bondText = "";
  const bond = clampNumber(winner.affection + Math.floor(winner.score / 18), 45, 96, winner.affection);
  if (state.gender === "male" && !state.family.spouse && !state.family.lover && bond >= 62) {
    state.family.lover = winner.name;
    state.family.loverMeta = normalizeRelative({
      name: winner.name,
      relation: "花魁知己",
      gender: "female",
      age: winner.age,
      physique: randInt(45, 78),
      affection: bond,
    }, state.name.slice(0, 1), "partner");
    state.family.spouseAffection = bond;
    bondText = `散场后，${winner.name}托人送来花笺，愿与你常通音讯，成为花魁知己。`;
  } else if (!state.friends.some((friend) => friend.name === winner.name)) {
    state.friends.push(normalizeFriend({
      name: winner.name,
      relation: "花魁知己",
      gender: "female",
      age: winner.age,
      physique: randInt(45, 78),
      affection: bond,
      lastMet: state.age,
    }));
    bondText = `${winner.name}记下你的赏识，日后可作一位风月场中的知己。`;
  }
  if (!state.tags.includes("瓦舍知音")) state.tags.push("瓦舍知音");
  const runnerUp = ranking[1];
  const text = `三轮竞选落定，${winner.name}以 ${winner.score} 分夺得花魁，${runnerUp ? `${runnerUp.name}居次。` : "满堂喝彩。"}你在席间赏才、问答、赠礼，既得一夜风雅，也添几分人脉牵连。${bondText}`;
  state.courtesanContest = null;
  view.page = "place";
  view.placeId = "theater";
  finishAction("花魁竞选", text, deltas, "FlowerChiefTitle");
}

function performPlaceAction(id) {
  if (!state || state.dead || state.prisonYears > 0) return;
  if (id === "prepareExam") return prepareExam();
  if (id === "courtesanContest") return startCourtesanContest();
  const deltas = [];
  let title = "去处";
  let text = "";
  let iconName = "Activity";
  if (id === "medicineTreat") {
    const cost = state.diseases.length ? randInt(45, 130) : randInt(20, 60);
    if (state.stats.money < cost) return;
    changeStat("money", -cost, deltas);
    if (state.diseases.length) {
      const cured = state.diseases.shift();
      changeStat("physique", randInt(4, 12), deltas);
      deltas.push({ label: "病症", value: `除${cured}` });
      text = `医者为你诊脉下药，${cured}渐有起色。`;
    } else {
      changeStat("physique", randInt(2, 6), deltas);
      text = "你请医者调养气血，虽无大病，也觉身轻。";
    }
    addLedger("医馆诊资", -cost, "问诊抓药。");
    title = "问诊";
    iconName = "MedicineBag";
  } else if (id === "medicineStudy") {
    changeStat("knowledge", randInt(2, 6), deltas);
    changeStat("virtue", randInt(1, 3), deltas);
    addInventoryItem("医书札记", deltas);
    title = "读医书";
    text = "你借医馆旧本研读，识得几味药性，也记下验方。";
    iconName = "MedicineBag";
  } else if (id === "farmWork") {
    const pay = randInt(18, 70);
    changeStat("money", pay, deltas);
    changeStat("physique", randInt(2, 6), deltas);
    changeStat("mood", randInt(-3, 2), deltas);
    addLedger("农田帮工", pay, "下田劳作。");
    title = "田间劳作";
    text = "你下田帮工，汗透衣背，换得一日辛苦钱。";
    iconName = "Agriculture";
  } else if (id === "farmTrade") {
    const amount = randInt(35, 120);
    changeStat("money", amount, deltas);
    changeStat("eq", randInt(1, 4), deltas);
    addLedger("农货买卖", amount, "转手农货。");
    title = "农货买卖";
    text = "你替乡人牵线买卖农货，薄利虽少，胜在稳当。";
    iconName = "Agriculture";
  } else if (id === "alchemyBrew") {
    const cost = randInt(80, 180);
    if (state.stats.money < cost) return;
    changeStat("money", -cost, deltas);
    const success = Math.random() + state.stats.knowledge / 180 > 0.68;
    if (success) {
      changeStat("physique", randInt(5, 14), deltas);
      addInventoryItem("丹丸", deltas);
      text = "炉火一夜未熄，丹砂凝成一丸，药性尚算平稳。";
    } else {
      changeStat("physique", -randInt(3, 10), deltas);
      changeStat("mood", -randInt(3, 8), deltas);
      text = "丹炉火候失准，呛烟扑面，反倒伤了精神。";
    }
    addLedger("丹房耗材", -cost, "购买丹砂药材。");
    title = "炼丹";
    iconName = "Elixir";
  } else if (id === "officialCase") {
    const just = Math.random() + (state.stats.eq + state.stats.virtue) / 210 > 0.58;
    changeStat("eq", randInt(1, 5), deltas);
    changeStat("virtue", just ? randInt(1, 5) : -randInt(1, 4), deltas);
    changeStat("favorability", just ? randInt(1, 4) : -randInt(1, 3), deltas);
    title = "旁听断案";
    text = just ? "你旁听县衙断案，明白几分情理法度。" : "堂上人情纷乱，你看得心惊，也知官非难断。";
    iconName = "Official";
  } else if (id === "innNews") {
    changeStat("eq", randInt(2, 6), deltas);
    changeStat("relationship", randInt(1, 5), deltas);
    if (Math.random() > 0.55) addFriend();
    title = "打听消息";
    text = "客栈人来人往，你听得几桩近闻，也结识了些过路人。";
    iconName = "Restaurant";
  } else if (id === "theaterWatch") {
    const story = sample(THEATER_WATCH_STORIES);
    applyEffectRanges(story.effects, deltas);
    if (story.friend) addFriend();
    if (story.item) addInventoryItem(story.item, deltas);
    title = story.title || "瓦舍";
    text = story.text || "台上锣鼓喧天，散场时你仍觉余音在耳。";
    iconName = story.icon || "Activity";
  } else if (id === "pleasureRisk") {
    const story = sample(PLEASURE_STORIES);
    const cost = rangeValue(story.cost || [90, 240]);
    if (state.stats.money < cost) return;
    changeStat("money", -cost, deltas);
    applyEffectRanges(story.effects, deltas);
    if (story.friend) addFriend();
    if (story.item) addInventoryItem(story.item, deltas);
    if (story.disease || Math.random() > 0.78) {
      const disease = sample(story.disease || ["风寒", "花柳暗疾", "惊悸"]);
      if (!state.diseases.includes(disease)) state.diseases.push(disease);
      deltas.push({ label: "病症", value: disease, negative: true });
    }
    addLedger("风月花销", -cost, story.title || "花酒应酬");
    title = story.title || "花酒";
    text = `${story.text || "你在风月场中消遣一夜，快意之外也添几分隐忧。"} 此番花销 ${moneyText(cost)}。`;
    iconName = story.icon || "Whorehouse";
  } else if (id === "templePray") {
    const cost = randInt(10, 60);
    changeStat("money", -Math.min(cost, Math.max(0, state.stats.money)), deltas);
    changeStat("virtue", randInt(2, 6), deltas);
    changeStat("mood", randInt(1, 5), deltas);
    if (!state.tags.includes("寺庙因缘")) state.tags.push("寺庙因缘");
    title = "祈福";
    text = "你焚香祈福，心绪稍定，也愿行事更谨慎。";
    iconName = "Temple";
  } else {
    return;
  }
  finishAction(title, text, deltas, iconName);
}

function buyGood(index, black = false) {
  const list = black ? BLACK_MARKET_GOODS : SHOP_GOODS;
  const item = list[Number(index)];
  if (!item || state.stats.money < item.price) return;
  if (item.stat !== "cricket" && !canAddInventoryItem(item.name)) return finishAction("行囊已满", "行囊已经塞满，暂且放不下新物件。", [{ label: "行囊", value: "已满", negative: true }], "Backpack");
  const deltas = [];
  changeStat("money", -item.price, deltas);
  if (item.stat === "cricket") {
    catchCricket(item.value + 1, false, deltas);
  } else {
    changeStat(item.stat, item.value, deltas);
  }
  if (black && item.risk) {
    const loss = item.risk === "money" ? -randInt(30, 120) : -randInt(2, 8);
    changeStat(item.risk, loss, deltas);
  }
  addInventoryItem(item.name, deltas);
  addLedger(black ? "黑市买卖" : "市集买物", -item.price, `购得${item.name}。`);
  finishAction(black ? "黑市" : "市集", `你买下${item.name}。${item.note}`, deltas, item.icon);
}

function marketFactor() {
  state.market ||= {};
  if (state.market.year !== state.year) {
    state.market.year = state.year;
    state.market.factor = Number((0.85 + Math.random() * 0.35).toFixed(2));
  }
  return Number(state.market.factor) || 1;
}

function marketPrice(base) {
  return Math.max(1, Math.round(Number(base || 0) * marketFactor()));
}

function buyShopGood(stallId, index) {
  const stall = MARKET_STALLS.find((item) => item.id === stallId);
  const item = stall?.goods?.[Number(index)];
  if (!stall || !item) return;
  const price = marketPrice(item.price);
  if (state.stats.money < price) return;
  if (item.stat !== "cricket" && !canAddInventoryItem(item.name)) return finishAction("行囊已满", "行囊已经塞满，暂且放不下新物件。", [{ label: "行囊", value: "已满", negative: true }], "Backpack");
  const deltas = [];
  changeStat("money", -price, deltas);
  if (item.stat === "cricket") {
    catchCricket(item.value + 1, false, deltas);
  } else {
    changeStat(item.stat, item.value, deltas);
  }
  if (stall.id === "pharmacy" && state.diseases.length && Math.random() > 0.45) {
    const cured = state.diseases.shift();
    deltas.push({ label: "病症", value: `除${cured}` });
  }
  addInventoryItem(item.name, deltas);
  addLedger(stall.label, -price, `购得${item.name}。`);
  finishAction(stall.label, `你在${stall.label}买下${item.name}。${item.note}`, deltas, item.icon || stall.icon);
}

function itemDefinition(name) {
  const goods = [...SHOP_GOODS, ...BLACK_MARKET_GOODS, ...MARKET_STALLS.flatMap((stall) => stall.goods || [])];
  const found = goods.find((item) => item.name === name) || ITEM_EFFECTS[name];
  if (found) return found;
  if (/书|卷|题|谱|帖|信/.test(name)) return { icon: "Book", sell: 30, stat: "knowledge", value: 3, note: "翻看一番，略有所得。" };
  if (/药|丸|散|汤|酒|丹|囊/.test(name)) return { icon: "MedicineBag", sell: 45, stat: "physique", value: 4, cure: true, note: "可调理身体。" };
  if (/玉|佩|香|脂|粉/.test(name)) return { icon: "Jade", sell: 60, stat: "looks", value: 2, note: "佩用妆点，添几分体面。" };
  return { icon: "Backpack", sell: 12, stat: "mood", value: 1, note: "寻常随身物件。" };
}

function canAddInventoryItem(name = "") {
  if (state.inventory.includes(name)) return true;
  if (/布包|行囊|箱/.test(name)) return true;
  return inventoryUsed() < inventoryCapacity();
}

function addInventoryItem(name, deltas = []) {
  if (!name) return false;
  if (state.inventory.includes(name)) return true;
  if (!canAddInventoryItem(name)) {
    deltas.push({ label: "行囊", value: "已满", negative: true });
    return false;
  }
  state.inventory.push(name);
  deltas.push({ label: "物品", value: name, type: "text" });
  return true;
}

function inventoryCount(name) {
  return state.inventory.filter((item) => item === name).length;
}

function removeInventoryItem(name) {
  const index = state.inventory.indexOf(name);
  if (index >= 0) state.inventory.splice(index, 1);
  return index >= 0;
}

function useInventoryItem(name) {
  if (!name || state.dead || state.prisonYears > 0 || !state.inventory.includes(name)) return;
  const item = itemDefinition(name);
  const deltas = [];
  if (item.stat === "cricket") {
    catchCricket(item.value + 1, false, deltas);
  } else {
    changeStat(item.stat || "mood", item.value || 1, deltas);
  }
  if (item.cure || /药|丸|散|汤|丹|囊/.test(name)) {
    const cured = state.diseases.shift();
    if (cured) deltas.push({ label: "病症", value: `除${cured}` });
  }
  if (!/家书|布老虎|小布包/.test(name)) removeInventoryItem(name);
  finishAction("使用物品", `你取出${name}。${item.note || "此物派上了用场。"}`, deltas, item.icon || itemIcon(name));
}

function sellInventoryItem(name) {
  if (!name || state.dead || !state.inventory.includes(name)) return;
  const item = itemDefinition(name);
  const price = Math.max(0, Math.round((item.sell ?? item.price ?? 30) * 0.45));
  if (price <= 0) return finishAction("旧物", `${name}不宜变卖，还是收着罢。`, [], item.icon || itemIcon(name));
  const deltas = [];
  removeInventoryItem(name);
  changeStat("money", price, deltas);
  addLedger("变卖物件", price, `卖出${name}。`);
  finishAction("变卖", `你将${name}转手卖出，得 ${moneyText(price)}。`, deltas, "CashBox");
}

function openBlackMarket() {
  const affordable = BLACK_MARKET_GOODS.filter((item) => state.stats.money >= item.price);
  const item = sample(affordable);
  if (!item) {
    return finishAction("黑市", "你摸到黑市门前，奈何囊中羞涩，只得空手而归。", [], "BlackMarket");
  }
  buyGood(BLACK_MARKET_GOODS.indexOf(item), true);
}

function advanceCricketYear(deltas = []) {
  if (!Array.isArray(state.crickets) || !state.crickets.length) return;
  const living = [];
  for (const cricket of state.crickets.map(normalizeCricket).filter(Boolean)) {
    cricket.age += 1;
    if (cricket.age >= cricket.lifespan || cricket.alive === false) {
      deltas.push({ label: "促织", value: `${cricket.name}寿尽`, negative: true });
      addLog("促织寿尽", `${cricket.name}养至 ${cricket.age} 年，鸣声渐歇，终归尘土。`, [{ label: "促织", value: cricket.name, negative: true }]);
    } else {
      living.push(cricket);
    }
  }
  state.crickets = living;
}

function catchCricket(bonus = 0, show = true, deltas = []) {
  const quality = clamp(randInt(18, 92) + bonus * 8, 1, 100);
  const cricket = {
    id: `cricket-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: sample(CRICKET_NAMES) || "青麻头",
    quality,
    age: 0,
    lifespan: randInt(6, 10),
    alive: true,
    wins: 0,
    icon: "Cricket",
  };
  state.crickets.push(cricket);
  state.crickets = state.crickets.sort((a, b) => b.quality - a.quality).slice(0, 8);
  deltas.push({ label: "促织", value: `${cricket.name} ${quality}`, type: "text" });
  changeStat("mood", randInt(1, 4), deltas);
  if (show) finishAction("捕促织", `你在墙根草露间捕得一只${cricket.name}，品相约 ${quality}，可养 ${cricket.lifespan} 年。`, deltas, "CatchCricket");
}

function cricketAction(action, cricketId = "") {
  if (action === "catch") return catchCricket();
  state.crickets = state.crickets.map(normalizeCricket).filter((item) => item && item.alive !== false);
  const selected = state.crickets.find((item) => item.id === cricketId) || [...state.crickets].sort((a, b) => b.quality - a.quality)[0];
  if (!selected) return;
  const deltas = [];
  const contest = action === "competition";
  const target = contest ? randInt(45, 95) : randInt(25, 86);
  const agePenalty = Math.max(0, selected.age - 4) * 4;
  const score = selected.quality - agePenalty + randInt(-18, 18);
  const win = score >= target;
  if (win) {
    selected.wins = (selected.wins || 0) + 1;
    state.cricketRecord.wins += 1;
    const prize = contest ? randInt(180, 620) : randInt(25, 120);
    changeStat("money", prize, deltas);
    addLedger(contest ? "促织大赛" : "斗促织", prize, `${selected.name}获胜。`);
    if (contest && selected.wins >= 3) state.cricketRecord.champion += 1;
  } else {
    state.cricketRecord.losses += 1;
    changeStat("mood", -randInt(2, 7), deltas);
  }
  const title = contest ? "促织大赛" : "斗促织";
  const text = win ? `${selected.name}振翅扑斗，竟胜过对手。` : `${selected.name}临阵失势，被对手压住了声势。`;
  finishAction(title, text, deltas, contest ? "CricketCompetition" : "CricketBattle");
}

function attendParty(index) {
  const theme = DATA.database?.partyThemes?.[Number(index)];
  if (!theme || !partyOpen(theme)) return;
  const deltas = [];
  const cost = /酒会|婚宴/.test(theme.name) ? randInt(40, 120) : randInt(8, 45);
  changeStat("money", -cost, deltas);
  changeStat("relationship", randInt(3, 10), deltas);
  changeStat(/诗|文|曲水/.test(theme.name) ? "knowledge" : "eq", randInt(1, 5), deltas);
  if (Math.random() > 0.5) addFriend();
  addLedger("赴宴", -cost, `赴${theme.name}。`);
  finishAction("宴会", `你赴${theme.name}，席间主题为${theme.keywords || "雅集"}，人情与见闻都有所得。`, deltas, "DrinkingWine");
}

function studyFemaleSkill(index) {
  const skill = FEMALE_SKILLS[Number(index)];
  if (!skill || state.gender !== "female" || state.age < 8) return;
  const deltas = [];
  state.femaleSkills[skill.name] = skillLevel(skill.name) + 1;
  changeStat(skill.stat, skill.value, deltas);
  changeStat("mood", randInt(-2, 2), deltas);
  if (!state.tags.includes("女学")) state.tags.push("女学");
  finishAction("女学", `你修习${skill.name}。${skill.note}`, deltas, skill.icon);
}

function sendLetter() {
  const target = state.family.lover || state.family.spouse || sample(state.friends)?.name;
  const deltas = [];
  if (!target) {
    addFriend();
    changeStat("relationship", randInt(1, 4), deltas);
    finishAction("书信", "你写下一封问候信，托人带去，倒也因此结下一段新缘。", deltas, "SendLetter");
    return;
  }
  changeStat("relationship", randInt(2, 7), deltas);
  changeStat("eq", randInt(1, 3), deltas);
  const friend = state.friends.find((item) => item.name === target);
  if (friend) friend.affection = clamp(friend.affection + randInt(2, 6));
  finishAction("书信", `你给${target}写了一封信，字句虽短，情意却到。`, deltas, "SendLetter");
}

function interactRelation(id, actionId) {
  const action = RELATION_ACTIONS[actionId];
  const target = findRelationTarget(id);
  if (!action || !target || state.dead || state.prisonYears > 0) return;
  if (action.cost && state.stats.money < action.cost) return;
  const deltas = [];
  if (action.cost) {
    changeStat("money", -action.cost, deltas);
    addLedger(`${action.label}亲友`, -action.cost, `${action.label}${target.name}。`);
  }
  if (action.money) {
    const amount = rangeValue(action.money);
    changeStat("money", amount, deltas);
    if (target.kind === "friend") target.person.debt = (target.person.debt || 0) + amount;
    addLedger("亲友周济", amount, `${target.name}借与你一笔钱。`);
  }
  changeStat("relationship", rangeValue(action.relationship || [0, 0]), deltas);
  if (action.mood) changeStat("mood", rangeValue(action.mood), deltas);
  if (action.physique) changeStat("physique", rangeValue(action.physique), deltas);
  target.person.affection = clamp(Number(target.person.affection ?? 60) + rangeValue(action.affection || [0, 0]));
  if (actionId === "care" && Number.isFinite(Number(target.person.physique))) {
    const boost = randInt(2, 6);
    target.person.physique = clamp(Number(target.person.physique) + boost);
    deltas.push({ label: `${target.name}体魄`, value: `+${boost}` });
  }
  target.person.lastMet = state.age;
  const followup = relationFollowup(target, actionId, deltas);
  finishAction(action.label, `${action.label}${target.name}，情分有了新的冷暖。${followup}`, deltas, action.icon);
}

function relationFollowup(target, actionId, deltas) {
  if (!target?.person || Math.random() > 0.58) return "";
  const affection = Number(target.person.affection ?? 60);
  if (target.kind === "family" && actionId === "care") {
    changeStat("virtue", randInt(1, 3), deltas);
    if (Math.random() > 0.55) changeStat("physique", randInt(1, 2), deltas);
    return " 对方记挂你的孝心，临别又叮嘱了几句。";
  }
  if (target.kind === "spouse" && (actionId === "visit" || actionId === "gift")) {
    state.family.spouseAffection = clamp(Number(state.family.spouseAffection ?? affection) + randInt(1, 4));
    changeStat("mood", randInt(1, 4), deltas);
    return " 夫妻间少了些生分，家中气氛也暖了起来。";
  }
  if (target.kind === "friend" && actionId === "visit" && Math.random() > 0.45) {
    addFriend();
    changeStat("relationship", randInt(1, 4), deltas);
    return " 友人又为你引见一位新相识。";
  }
  if (actionId === "gift" && affection >= 65 && Math.random() > 0.45) {
    const returnGift = randInt(8, 28);
    changeStat("money", returnGift, deltas);
    addLedger("亲友回礼", returnGift, `${target.name}念着情分，回赠薄礼。`);
    return " 对方没有空手受礼，转身也回了一份薄礼。";
  }
  if (actionId === "borrow") {
    changeStat("eq", randInt(1, 2), deltas);
    if (Math.random() > 0.62) changeStat("relationship", -randInt(1, 3), deltas);
    return " 这笔人情记在账上，日后还需好好周全。";
  }
  if (target.kind === "child" && (actionId === "visit" || actionId === "care")) {
    target.person.study = clamp(Number(target.person.study || 0) + randInt(1, 4));
    changeStat("mood", randInt(1, 3), deltas);
    return " 孩子听得认真，学业也多了些长进。";
  }
  return "";
}

function findRelationTarget(id) {
  if (!id) return null;
  if (id === "father") return { kind: "family", name: state.family.father?.name, person: state.family.father };
  if (id === "mother") return { kind: "family", name: state.family.mother?.name, person: state.family.mother };
  if (id === "spouse" && state.family.spouse) {
    state.family.spouseAffection = clamp(Number(state.family.spouseAffection ?? 78));
    state.family.spouseMeta = normalizeRelative({ relation: "配偶", gender: state.gender === "female" ? "male" : "female", alive: true, affection: state.family.spouseAffection, ...state.family.spouseMeta, name: state.family.spouse }, state.name.slice(0, 1), "partner");
    Object.defineProperty(state.family.spouseMeta, "affection", {
      configurable: true,
      get() { return state.family.spouseAffection; },
      set(value) { state.family.spouseAffection = clamp(Number(value ?? 78)); },
    });
    return { kind: "spouse", name: state.family.spouse, person: state.family.spouseMeta };
  }
  if (id === "lover" && state.family.lover) {
    state.family.loverMeta = normalizeRelative({ relation: "相看之人", gender: state.gender === "female" ? "male" : "female", alive: true, affection: 64, ...state.family.loverMeta, name: state.family.lover }, state.name.slice(0, 1), "partner");
    return { kind: "lover", name: state.family.lover, person: state.family.loverMeta };
  }
  const sibling = (state.family.siblings || []).find((person) => person.name === id || person.id === id);
  if (sibling) return { kind: "family", name: sibling.name, person: sibling };
  const friend = state.friends.find((person) => person.id === id || person.name === id);
  if (friend) return { kind: "friend", name: friend.name, person: friend };
  const child = livingChildren().find((person) => person.id === id || person.name === id);
  if (child) return { kind: "child", name: child.name, person: child };
  return null;
}

function teachChild(id) {
  const child = livingChildren().find((item) => item.id === id);
  if (!child || state.stats.money < CHILD_EDU_COST || state.dead || state.prisonYears > 0) return;
  const deltas = [];
  changeStat("money", -CHILD_EDU_COST, deltas);
  child.study = clamp(child.study + randInt(5, 12) + Math.floor(state.stats.knowledge / 25));
  child.virtue = clamp(child.virtue + randInt(1, 5));
  child.affection = clamp(child.affection + randInt(3, 9));
  addLedger("子女教养", -CHILD_EDU_COST, `为${child.name}请师授课。`);
  finishAction("教养子女", `你为${child.name}延师授课，又亲自督看功课。${child.name}学业渐进，也更亲近你。`, deltas, "Book");
}

function inheritFromChild(id) {
  const heir = eligibleHeirs().find((item) => item.id === id);
  if (!state.dead || !heir) return;
  const oldName = state.name;
  const oldLog = [...state.log];
  const oldGender = state.gender;
  const oldScore = lifeScore();
  const oldGrade = lifeGrade(oldScore);
  const generation = Math.max(1, Number(state.lineage?.generation) || 1);
  const inheritedMoney = Math.max(20, Math.round(Math.max(0, state.stats.money || 0) * 0.78));
  const inheritedAssets = (state.assets || []).map((asset) => ({ ...asset, inherited: true, owner: heir.name }));
  const inheritedInventory = [...new Set([...(state.inventory || []), "家书"])]
    .filter((item) => typeof item === "string")
    .slice(0, 18);
  const familyName = heir.name.slice(0, 1);
  const spouseName = state.family.spouse;
  const siblings = livingChildren()
    .filter((child) => child.id !== heir.id)
    .map((child) => ({
      name: child.name,
      relation: child.gender === "female" ? (child.age >= heir.age ? "姐姐" : "妹妹") : child.age >= heir.age ? "哥哥" : "弟弟",
      gender: child.gender,
      alive: child.alive,
      affection: child.affection,
      age: child.age,
      physique: randInt(45, 78),
    }));
  const ancestors = [
    {
      name: oldName,
      age: state.age,
      reason: state.deathReason || "命数已尽",
      score: oldScore,
      grade: oldGrade,
      exam: state.exam.rank >= 0 ? EXAM_TITLES[state.exam.rank] : "白身",
      assets: (state.assets || []).length,
      money: Math.round(state.stats.money || 0),
    },
    ...((state.lineage?.ancestors || []).slice(0, 11)),
  ];
  const heirAge = Math.max(0, Math.round(Number(heir.age) || 0));
  const startAge = heirAge;
  const heirStudy = clamp(Number(heir.study || 0));
  const heirVirtue = clamp(Number(heir.virtue || 50));
  const heirAptitude = clamp(Number(heir.aptitude || 55));
  state = normalizeState({
    name: heir.name,
    gender: heir.gender,
    profileAvatar: defaultProfileAvatar(heir.gender),
    difficulty: "承继",
    age: startAge,
    year: startAge,
    location: state.location,
    stats: {
      mood: clamp(50 + Math.floor((heir.affection || 60) / 10) - (heirAge < 12 ? 4 : 0)),
      physique: clamp(42 + Math.floor(heirVirtue / 6) + randInt(-4, 8)),
      looks: randInt(35, 75),
      eq: clamp(28 + Math.floor(heirVirtue / 4) + Math.floor(heirAptitude / 12)),
      knowledge: clamp(24 + Math.floor(heirStudy / 2) + Math.floor(heirAptitude / 10)),
      virtue: clamp(30 + Math.floor(heirVirtue / 2)),
      relationship: clamp(24 + Math.floor((heir.affection || 60) / 4) + Math.min(12, siblings.length * 2)),
      favorability: Math.max(0, Math.round((state.stats.favorability || 0) * 0.18)),
      money: inheritedMoney,
    },
    talents: pickMany(DATA.database?.talents || [], 3),
    coreTalent: sample(DATA.database?.coreTalents || []),
    career: null,
    friends: [],
    tags: ["承继家业"],
    diseases: [],
    inventory: inheritedInventory,
    log: [
      { age: startAge, title: "承继家业", text: `${oldName}身后，${heir.name}承继第 ${generation + 1} 代家业。上一代命格总评为${oldGrade}，${oldScore}分；遗下钱财 ${moneyText(inheritedMoney)}、家产 ${inheritedAssets.length} 处。` },
      { age: startAge, title: "家族命册", text: `家中旧事由长辈收束成册，${heir.name}自此接过门户，也接过${oldName}未竟之事。` },
      ...oldLog.slice(0, 42).map((item) => ({ ...item, inherited: true })),
    ],
    biography: `${heir.name}承${oldName}遗业而立，是这一门第 ${generation + 1} 代主事人。家中旧事皆入命册，钱财田宅亦随之过户。`,
    assets: inheritedAssets,
    ledger: [
      { age: startAge, title: "承继家产", amount: inheritedMoney, text: `承继${oldName}遗下的钱财与产业。` },
      ...(state.ledger || []).slice(0, 80).map((item) => ({ ...item, inherited: true })),
    ],
    crickets: [],
    cricketRecord: { wins: 0, losses: 0, champion: 0 },
    femaleSkills: heir.gender === "female" ? { 诗书: Math.floor(heirStudy / 20) } : {},
    official: { rank: 0, merit: 0 },
    lineage: {
      generation: generation + 1,
      familyName,
      ancestors,
    },
    life: { milestones: [], goals: [] },
    study: { prep: Math.floor(heirStudy / 4), lastYear: -1 },
    gamble: createGambleRound(50),
    miniGames: createMiniGamesState(),
    courtesanContest: null,
    market: { year: -1, factor: 1 },
    caravanMemory: normalizeCaravanMemory(state.caravanMemory),
    family: {
      father: { name: oldGender === "male" ? oldName : spouseName || `${familyName}父`, relation: "父亲", gender: "male", alive: oldGender !== "male" && !!spouseName, age: oldGender === "male" ? state.age : Math.max(22, state.age - randInt(0, 5)), physique: oldGender === "male" ? 0 : randInt(38, 72), affection: 76 },
      mother: { name: oldGender === "female" ? oldName : spouseName || `${familyName}母`, relation: "母亲", gender: "female", alive: oldGender !== "female" && !!spouseName, age: oldGender === "female" ? state.age : Math.max(22, state.age - randInt(0, 5)), physique: oldGender === "female" ? 0 : randInt(38, 72), affection: 76 },
      siblings,
      lover: false,
      spouse: null,
      children: [],
    },
    exam: { rank: -1, attempts: 0, history: [], current: null, lastYear: -1 },
    pendingActivity: null,
    eventResult: null,
    pendingSurprise: null,
    pendingCaravan: null,
    currentEvent: null,
    inventoryTab: "all",
    lastDeltas: [{ label: "承继", value: `${heir.name} · 第${generation + 1}代` }],
    dead: false,
    deathReason: "",
    prisonYears: 0,
  });
  view = { screen: "game", page: "main", tab: "overview", activityId: "", placeId: "", overlay: "" };
  save();
  render();
}

function marryLover() {
  if (!state.family.lover || state.family.spouse || state.age < 16) return;
  SFX.play("marry");
  const deltas = [];
  const cost = randInt(120, 420);
  const actualCost = Math.min(cost, Math.max(0, state.stats.money));
  changeStat("money", -actualCost, deltas);
  changeStat("mood", randInt(8, 16), deltas);
  changeStat("relationship", randInt(6, 14), deltas);
  state.family.spouse = state.family.lover;
  state.family.spouseMeta = normalizeRelative({ ...state.family.loverMeta, name: state.family.spouse, relation: "配偶", affection: state.family.spouseAffection || 82 }, state.name.slice(0, 1), "partner");
  state.family.lover = false;
  state.family.loverMeta = null;
  addLedger("婚仪", -actualCost, `与${state.family.spouse}成婚。`);
  finishAction("成婚", `红烛高照，你与${state.family.spouse}成礼，自此家中多了一位同路人。`, deltas, "ArrangeMarriage");
}

function handleOfficialWork() {
  if (!state.career || careerKind(state.career) !== "official") return;
  const deltas = [];
  const office = officialOffice();
  const rankBonus = Math.floor(officialRankIndex() / 3);
  const merit = randInt(8, 22) + Math.floor((state.stats.eq + state.stats.knowledge) / 30) + rankBonus;
  state.official.merit += merit;
  changeStat("eq", randInt(1, 4), deltas);
  changeStat("virtue", randInt(-1, 3), deltas);
  changeStat("money", randInt(20, 80) + rankBonus * 10, deltas);
  let text = `你以${office.office}身份处理${office.scope}公务，${office.duty}得政绩 ${merit}。`;
  text += applyOfficialPromotion(deltas);
  finishAction("官府", text, deltas, "Official");
}

function officialRankIndex() {
  return clamp(Math.round(Number(state.official?.rank) || 0), 0, OFFICIAL_RANKS.length - 1);
}

function officialOffice(rank = officialRankIndex()) {
  return OFFICIAL_RANKS[clamp(Math.round(Number(rank) || 0), 0, OFFICIAL_RANKS.length - 1)] || OFFICIAL_RANKS[0];
}

function officialTitle() {
  const office = officialOffice();
  return `${office.grade} · ${office.office}`;
}

function nextOfficialTitle() {
  const rank = officialRankIndex();
  if (rank >= OFFICIAL_RANKS.length - 1) return "位极人臣";
  const next = officialOffice(rank + 1);
  return `${next.grade} · ${next.office}`;
}

function nextOfficialMeritNeed() {
  const rank = officialRankIndex();
  if (rank >= OFFICIAL_RANKS.length - 1) return 0;
  return Math.max(0, (OFFICIAL_PROMOTION_MERIT[rank + 1] || 0) - Math.round(state.official?.merit || 0));
}

function applyOfficialPromotion(deltas = []) {
  let text = "";
  while (officialRankIndex() < OFFICIAL_RANKS.length - 1 && state.official.merit >= OFFICIAL_PROMOTION_MERIT[officialRankIndex() + 1]) {
    state.official.rank = officialRankIndex() + 1;
    const title = officialTitle();
    text += ` 官评递进，升至 ${title}。`;
    deltas.push({ label: "官阶", value: title, type: "text" });
  }
  if (officialRankIndex() >= OFFICIAL_RANKS.length - 1) {
    text += " 仕途已至正一品，位极人臣。";
  }
  return text;
}

function finishAction(title, text, deltas, iconName) {
  state.lastDeltas = deltas;
  state.eventResult = { title, text, deltas, icon: iconName || resultIcon({ title, content: text }, null) };
  addLog(title, text, deltas);
  save();
  render();
}

function addFriend() {
  const name = makePersonName(Math.random() > 0.5 ? "male" : "female");
  if (!state.friends.some((friend) => friend.name === name)) state.friends.push(normalizeFriend({ name, gender: Math.random() > 0.5 ? "male" : "female", affection: randInt(38, 72), lastMet: state.age }));
}

function mergeDeltas(...groups) {
  return groups.flatMap((group) => (Array.isArray(group) ? group : [])).filter(Boolean);
}

function examTakenThisYear() {
  return Number(state.exam?.lastYear) === Number(state.year);
}

function addExamPrep(amount, deltas) {
  state.study ||= normalizeStudy();
  const before = Number(state.study.prep) || 0;
  state.study.prep = clamp(before + Number(amount || 0));
  const actual = Math.round(state.study.prep - before);
  if (actual && deltas) deltas.push({ label: "备考", value: actual });
}

function consumeExamPrep() {
  state.study ||= normalizeStudy();
  const prep = Math.round(Number(state.study.prep) || 0);
  state.study.prep = Math.floor(prep * 0.35);
  return prep;
}

function canPrepareExam() {
  return !state.dead && !state.currentEvent && !state.eventResult && state.prisonYears <= 0 && state.age >= 8;
}

function prepareExam() {
  if (!canPrepareExam()) return;
  const deltas = [];
  const cost = Math.min(Math.max(0, state.stats.money), state.age >= 15 ? randInt(24, 72) : randInt(8, 28));
  if (cost) {
    changeStat("money", -cost, deltas);
    addLedger("书院束脩", -cost, "在书院备考温课。");
  }
  changeStat("knowledge", randInt(4, 9), deltas);
  changeStat("mood", -randInt(1, 4), deltas);
  addExamPrep(randInt(14, 24), deltas);
  if (!state.tags.includes("备考")) state.tags.push("备考");
  state.lastDeltas = deltas;
  addLog("备考", "你在书院温经读题，先生圈点得失，心里对下场考试更有把握。", deltas);
  state.age += 1;
  state.year += 1;
  applyAgeMilestones(deltas);
  view.page = "main";
  finishYear();
}

function markExamAttempt() {
  if (!state.exam) return;
  state.exam.lastYear = Number.isFinite(Number(state.year)) ? Number(state.year) : state.age;
}

function hasPalaceAppointment() {
  return state.exam.rank >= EXAM_STAGES.length - 1 || state.tags.includes("进士") || state.tags.includes("殿试及第") || !!state.official?.unlocked;
}

function careerLockedReason(career) {
  const genderRequire = Number(career?.genderRequire ?? career?.GenderRequire);
  if (genderRequire === 1 && state.gender !== "female") return "女子可任";
  if (careerKind(career) === "official" && !hasPalaceAppointment()) return "殿试后可任职";
  return "";
}

function canOpenExam() {
  return !state.dead && !state.currentEvent && !state.eventResult && !state.pendingCaravan && state.prisonYears <= 0 && state.age >= MAIN_EXAM_MIN_AGE && !examTakenThisYear() && state.exam.rank < EXAM_STAGES.length - 1 && imperialQuestionPool().length > 0;
}

function examStatusNote() {
  const next = state.exam.rank >= EXAM_STAGES.length - 1 ? null : EXAM_STAGES[state.exam.rank + 1];
  const title = state.exam.rank >= 0 ? EXAM_TITLES[state.exam.rank] : "白身";
  let reason = "APK 题库未加载。";
  if (imperialQuestionPool().length > 0) {
    if (state.exam.rank >= EXAM_STAGES.length - 1) reason = "殿试已毕，可在营生中选择官府职任。";
    else if (state.age < MAIN_EXAM_MIN_AGE) reason = `需满 ${MAIN_EXAM_MIN_AGE} 岁后参加童试。`;
    else if (examTakenThisYear()) reason = "今年已经参加过考试，须待来年再试。";
    else reason = `当前功名：${title}。${next ? `下一场：${next.name}。` : "已是进士，科名已尽。"}`;
  }
  return `<p class="empty-note">${escapeHtml(reason)}</p>`;
}

function canOpenExtraExam(type) {
  if (state.dead || state.currentEvent || state.eventResult || state.pendingCaravan || state.prisonYears > 0 || state.age < MAIN_EXAM_MIN_AGE || examTakenThisYear()) return false;
  if ((type === "female" || type?.startsWith?.("female-")) && state.gender !== "female") return false;
  return extraExamQuestions(type).length > 0;
}

function startExam() {
  if (!canOpenExam()) return;
  const stageIndex = Math.min(state.exam.rank + 1, EXAM_STAGES.length - 1);
  const stage = EXAM_STAGES[stageIndex];
  markExamAttempt();
  if (stage.type === "palace") {
    const topic = sample(palaceQuestionPool());
    state.exam.current = {
      stageIndex,
      type: "palace",
      topic,
      theme: "",
      writingStyle: "",
    };
  } else {
    const pool = [
      ...imperialQuestionPool(),
      ...(state.gender === "female" ? femaleQuestionPool() : []),
    ];
    const questions = pickMany(pool, stage.count).map((question) => {
      const answers = shuffle(question.answers || []);
      return {
        content: question.content,
        answers,
        correct: question.correct || question.answers?.[0],
        selected: "",
      };
    });
    state.exam.current = {
      stageIndex,
      type: "choice",
      questions,
    };
  }
  state.exam.attempts += 1;
  view.page = "exam";
  save();
  render();
}

function startExtraExam(type) {
  if (!canOpenExtraExam(type)) return;
  const config = extraExamConfig(type);
  markExamAttempt();
  const questions = pickMany(extraExamQuestions(type), config.count).map((question) => ({
    content: question.content,
    answers: shuffle(question.answers || []),
    correct: question.correct || question.answers?.[0],
    selected: "",
  }));
  state.exam.current = {
    stageIndex: -1,
    type: "choice",
    extraType: type,
    extraStage: config,
    questions,
  };
  state.exam.attempts += 1;
  view.page = "exam";
  save();
  render();
}

function extraExamConfig(type) {
  return {
    poem: { name: "诗词试", title: "诗词小成", pass: 3, count: 4, stat: "knowledge" },
    writing: { name: "经义小试", title: "经义通达", pass: 3, count: 5, stat: "knowledge" },
    female: { name: "女医合考", title: "女医试", pass: 4, count: 5, stat: "virtue" },
    "female-sore": { name: "女医疮疡", title: "疮疡入门", pass: 4, count: 5, stat: "virtue" },
    "female-one": { name: "女医总论一", title: "医理一通", pass: 4, count: 5, stat: "knowledge" },
    "female-two": { name: "女医总论二", title: "医理再通", pass: 4, count: 5, stat: "knowledge" },
  }[type] || { name: "小试", title: "小试有成", pass: 3, count: 4, stat: "knowledge" };
}

function extraExamQuestions(type) {
  const questions = DATA.database?.questions || {};
  if (REMOVED_EXAM_TYPES.includes(type)) return [];
  if (type === "writing") return readingWritingQuestions();
  if (type === "female") return femaleQuestionPool();
  if (type === "female-sore") return normalizeChoiceQuestions(questions.female?.ExaminationOfWoundAndSore || []);
  if (type === "female-one") return normalizeChoiceQuestions(questions.female?.GeneralExaminationOfOne || []);
  if (type === "female-two") return normalizeChoiceQuestions(questions.female?.GeneralExaminationOfTow || []);
  if (type === "poem") return poemQuestions(questions.poems || []);
  return [];
}

function imperialQuestionPool() {
  return normalizeChoiceQuestions([...(DATA.database?.questions?.imperialChoice || []), ...SUPPLEMENTAL_IMPERIAL_QUESTIONS]);
}

function palaceQuestionPool() {
  return [...(DATA.database?.questions?.palace || []), ...SUPPLEMENTAL_PALACE_TOPICS];
}

function femaleQuestionPool() {
  const femaleQuestions = DATA.database?.questions?.female || {};
  return normalizeChoiceQuestions(
    Object.entries(femaleQuestions)
      .filter(([key]) => !/English/i.test(key))
      .flatMap(([, list]) => list || [])
  );
}

function normalizeChoiceQuestions(list) {
  return (list || [])
    .filter((item) => item?.content && Array.isArray(item.answers) && item.answers.length >= 2)
    .map((item) => ({ content: item.content, answers: item.answers, correct: item.correct || item.answers[0] }));
}

function poemQuestions(poems) {
  const allLines = (poems || []).flatMap((poem) => poem.content || []).filter(Boolean);
  return (poems || [])
    .filter((poem) => poem?.name && Array.isArray(poem.content) && poem.content.length)
    .map((poem) => {
      const correct = sample(poem.content);
      const prompt = poem.content.map((line) => (line === correct ? "____" : line)).join(" / ");
      const answers = shuffle([correct, ...pickMany(allLines.filter((line) => line !== correct), 3)]);
      return { content: `《${poem.name}》中空缺的一句是：${prompt}`, answers, correct };
    });
}

function readingWritingQuestions() {
  return normalizeChoiceQuestions(SUPPLEMENTAL_LITERACY_QUESTIONS);
}

function shuffle(list) {
  const pool = [...(list || [])];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
}

function answerExam(questionIndex, answer) {
  const current = state.exam.current;
  if (!current || current.type !== "choice") return;
  const question = current.questions?.[Number(questionIndex)];
  if (!question) return;
  question.selected = answer;
  save();
  render();
}

function choosePalace(field, value) {
  const current = state.exam.current;
  if (!current || current.type !== "palace") return;
  if (field === "theme") current.theme = value;
  if (field === "style") current.writingStyle = value;
  save();
  render();
}

function submitExam() {
  const current = state.exam.current;
  if (!current) return;
  const stage = current.extraStage || EXAM_STAGES[current.stageIndex] || EXAM_STAGES[0];
  const deltas = [];
  let passed = false;
  let score = 0;
  let text = "";
  const prepBeforeExam = consumeExamPrep();
  const prepBonus = Math.floor(prepBeforeExam / 28);
  if (prepBeforeExam > 0) deltas.push({ label: "备考", value: `用去${prepBeforeExam}` });

  if (current.type === "choice") {
    const rawScore = (current.questions || []).filter((question) => question.selected && question.selected === question.correct).length;
    score = Math.min(current.questions.length, rawScore + prepBonus);
    passed = score >= stage.pass;
    text = `${stage.name}放榜，答中 ${rawScore}/${current.questions.length} 题${prepBonus ? `，备考补益折作 ${score} 分` : ""}，${passed ? `取中${stage.title}` : "名落孙山"}。`;
  } else {
    const topic = current.topic || sample(DATA.database?.questions?.palace || {});
    const knowledgeScore = Math.round((state.stats.knowledge || 0) * 0.55);
    const eqScore = Math.round((state.stats.eq || 0) * 0.25);
    const virtueScore = Math.round((state.stats.virtue || 0) * 0.2);
    score = clamp(knowledgeScore + eqScore + virtueScore + Math.min(12, prepBonus * 2) + randInt(-8, 12), 0, 100);
    passed = score >= stage.pass;
    const resultText = Array.isArray(topic?.resultDescription?.[0]) ? topic.resultDescription[0].slice(0, 4).join("，") : "文理清通，颇得考官青眼";
    text = `${stage.name}策问「${topic?.topic || "治世之道"}」，取${current.theme || "治国"}为旨，行文${current.writingStyle || "堂堂正正"}。${resultText}。${prepBonus ? "考前积累也添了几分底气。" : ""}评分 ${score}，${passed ? "金榜题名" : "仍待来年"}。`;
  }

  if (passed && current.extraType) {
    SFX.play("exam-pass");
    if (!state.tags.includes(stage.title)) state.tags.push(stage.title);
    changeStat(stage.stat || "knowledge", randInt(3, 7), deltas);
    changeStat("mood", randInt(2, 7), deltas);
    changeStat("money", randInt(12, 60), deltas);
  } else if (passed) {
    state.exam.rank = Math.max(state.exam.rank, current.stageIndex);
    state.tags = state.tags.filter((tag) => !EXAM_TITLES.includes(tag));
    state.tags.push(stage.title);
    if (current.stageIndex === EXAM_STAGES.length - 1) {
      state.official.unlocked = true;
      if (!state.tags.includes("殿试及第")) state.tags.push("殿试及第");
      text += " 自此可在营生中选择官府职任。";
    }
    changeStat("knowledge", randInt(3, 7), deltas);
    changeStat("eq", randInt(1, 4), deltas);
    changeStat("money", current.type === "palace" ? randInt(120, 280) : randInt(30, 120), deltas);
  } else {
    SFX.play("exam-fail");
    changeStat("mood", -randInt(4, 12), deltas);
    changeStat("knowledge", randInt(1, 3), deltas);
  }

  const record = { age: state.age, stage: stage.name, score, passed, title: passed ? stage.title : "" };
  state.exam.history.unshift(record);
  state.exam.history = state.exam.history.slice(0, 20);
  state.exam.current = null;
  state.lastDeltas = deltas;
  addLog(stage.name, text, deltas);
  state.age += 1;
  state.year += 1;
  applyAgeMilestones(deltas);
  runAnnualAftermath(deltas);
  unlockLifeGoals();
  view.page = "main";
  save();
  render();
}

function addLog(title, text, deltas = []) {
  state.log.unshift({ age: state.age, title, text, deltas });
  state.log = state.log.slice(0, 160);
}

function fillPlaceholders(text, mutate = true) {
  let n = 0;
  return String(text || "").replace(/\{(\d+)\}/g, () => {
    const existing = state.friends[n++];
    const friend = existing?.name || existing || makePersonName(state.gender === "male" ? "female" : "male");
    if (mutate && !state.friends.some((item) => item.name === friend)) {
      state.friends.push(normalizeFriend({ name: friend, gender: Math.random() > 0.5 ? "male" : "female", affection: randInt(38, 72), lastMet: state.age }));
    }
    return friend;
  });
}

function makePersonName(gender) {
  const names = DATA.database?.names || {};
  return `${sample(names.last) || "赵"}${sample(gender === "female" ? names.female : names.male) || "无名"}`;
}

function conditionsPass(conditions) {
  for (const cond of conditions || []) {
    const name = cond.name || "";
    if (name === "GetProbability") {
      const value = conditionNumber(cond.para);
      if (!Number.isFinite(value)) continue;
      const chance = value > 1 ? value / 100 : value;
      if (Math.random() > clamp(chance, 0, 1)) return false;
    }
    if (name === "HaveTag" || name === "IsHaveTag") {
      const tag = extractText(cond.para);
      const expected = lastBoolean(cond.para, true);
      if (tag && state.tags.includes(tag) !== expected) return false;
    }
    if (name === "Gender") {
      const value = conditionNumber(cond.para);
      if (value === 1 && state.gender !== "male") return false;
      if (value === 2 && state.gender !== "female") return false;
    }
    if (name === "IsR18") {
      const expected = firstBoolean(cond.para, true);
      if ((state.age >= 18) !== expected) return false;
    }
    if (name === "PersonIntProperty" && !intConditionPass(cond.para || [])) return false;
    if (name === "PersonCareerIs" || name === "PersonJobIs") {
      const expected = firstBoolean(cond.para, true);
      const text = extractText(cond.para);
      const actual = text ? Boolean(state.career?.name?.includes(text)) : !!state.career;
      if (actual !== expected) return false;
    }
    if ((name === "PersonHaveItem" || name === "HaveItem") && !hasInventoryItem(cond.para || [])) return false;
    if (name === "IsGotoSchool") {
      const expected = lastBoolean(cond.para, true);
      if (state.tags.includes("入学") !== expected) return false;
    }
    if (name === "PersonBoolPropertyIsTrue" && !boolConditionPass(cond.para || [])) return false;
    if (name === "PersonIsDeath" && firstBoolean(cond.para, false)) return false;
    if (name === "PersonIsNull" && personExists(findDataVar(cond.para)?.member)) return false;
    if ((name === "PersonHaveBrotherOrSister" || name === "PersonHaveBrotherAndSister") && !hasRelative(cond.para || [])) return false;
    if (name === "PersonSchoolType" && state.age < 8 && !state.tags.includes("入学")) return false;
  }
  return true;
}

function intConditionPass(para) {
  const target = findDataVar(para);
  const check = para.find((item) => item && typeof item === "object" && "Symbol" in item) || {};
  const member = target?.member || "";
  const stat = MEMBER_MAP[member];
  const actual = member === "Age" ? state.age : stat ? state.stats[stat] ?? 0 : 0;
  const values = Array.isArray(check.Value) ? check.Value.map(Number).filter(Number.isFinite) : [];
  const symbol = Number(check.Symbol);
  if (!values.length) return true;
  if (symbol === 0) return actual >= values[0];
  if (symbol === 1) return actual === values[0];
  if (symbol === 2) return actual < values[0];
  if (symbol === 3) return actual >= Math.min(...values) && actual <= Math.max(...values);
  return true;
}

function boolConditionPass(para) {
  const target = findDataVar(para);
  const expected = lastBoolean(para, true);
  const member = target?.member || "";
  let actual = false;
  if (member === "IsDeath") actual = false;
  if (member === "IsBeOfficial") actual = /县|衙|主簿|县丞|官/.test(state.career?.name || "");
  if (member === "IsInSameCityOfSelf") actual = true;
  if (member === "HasSpouse" || member === "IsMarried") actual = !!state.family.spouse;
  if (member === "HaveSon" || member === "HasChild") actual = livingChildren().length > 0;
  if (member === "IsGotoSchool") actual = state.tags.includes("入学");
  return actual === expected;
}

function hasInventoryItem(para) {
  const expected = lastBoolean(para, true);
  const text = extractText(para);
  const actual = text
    ? state.inventory.some((item) => String(item).includes(text)) || state.tags.includes(text)
    : state.inventory.length > 0;
  return actual === expected;
}

function hasRelative(para) {
  const expected = lastBoolean(para, true);
  const member = findDataVar(para)?.member || "";
  let actual = false;
  if (member === "Father") actual = !!state.family.father?.alive;
  if (member === "Mother") actual = !!state.family.mother?.alive;
  if (member === "m_Brother") actual = (state.family.siblings || []).some((person) => person.alive !== false);
  if (member === "Son") actual = livingChildren().length > 0;
  if (member === "Lover") actual = state.family.lover;
  if (member === "Wife" || member === "Husband" || member === "Spouse") actual = !!state.family.spouse;
  return actual === expected;
}

function personExists(member) {
  if (member === "Father") return !!state.family.father?.alive;
  if (member === "Mother") return !!state.family.mother?.alive;
  if (member === "m_Brother") return (state.family.siblings || []).some((person) => person.alive !== false);
  if (member === "Lover") return state.family.lover;
  if (member === "Son") return livingChildren().length > 0;
  if (member === "Wife" || member === "Husband" || member === "Spouse") return !!state.family.spouse;
  return true;
}

function findDataVar(value) {
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findDataVar(item);
      if (found) return found;
    }
  } else if (value && typeof value === "object") {
    if (value.kind === "DataVar") return value;
    for (const item of Object.values(value)) {
      const found = findDataVar(item);
      if (found) return found;
    }
  }
  return null;
}

function numericArrays(value, out = []) {
  if (Array.isArray(value)) {
    if (value.length && value.every((item) => typeof item === "number")) out.push(value);
    value.forEach((item) => numericArrays(item, out));
  } else if (value && typeof value === "object") {
    Object.values(value).forEach((item) => numericArrays(item, out));
  }
  return out;
}

function fixedFromPara(para) {
  const arrays = numericArrays(para).filter((item) => item.length);
  const last = arrays[arrays.length - 1] || [0];
  return Math.round(last[0] || 0);
}

function randomFromPara(para) {
  const arrays = numericArrays(para).filter((item) => item.length >= 2);
  const last = arrays[arrays.length - 1] || [0, 0];
  return randInt(Math.min(last[0], last[1]), Math.max(last[0], last[1]));
}

function extractText(value) {
  if (typeof value === "string" && /[\u4e00-\u9fff]/.test(value)) return value;
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = extractText(item);
      if (found) return found;
    }
  } else if (value && typeof value === "object") {
    for (const item of Object.values(value)) {
      const found = extractText(item);
      if (found) return found;
    }
  }
  return "";
}

function conditionNumber(para) {
  const parts = Array.isArray(para) ? para.slice(1) : para;
  return firstNumber(parts);
}

function firstNumber(value) {
  if (typeof value === "number") return value;
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = firstNumber(item);
      if (Number.isFinite(found)) return found;
    }
  } else if (value && typeof value === "object") {
    for (const item of Object.values(value)) {
      const found = firstNumber(item);
      if (Number.isFinite(found)) return found;
    }
  }
  return undefined;
}

function firstBoolean(value, fallback = false) {
  if (typeof value === "boolean") return value;
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = firstBoolean(item, undefined);
      if (typeof found === "boolean") return found;
    }
  } else if (value && typeof value === "object") {
    for (const item of Object.values(value)) {
      const found = firstBoolean(item, undefined);
      if (typeof found === "boolean") return found;
    }
  }
  return fallback;
}

function lastBoolean(value, fallback = false) {
  const booleans = [];
  collectBooleans(value, booleans);
  return booleans.length ? booleans[booleans.length - 1] : fallback;
}

function collectBooleans(value, out) {
  if (typeof value === "boolean") out.push(value);
  else if (Array.isArray(value)) value.forEach((item) => collectBooleans(item, out));
  else if (value && typeof value === "object") Object.values(value).forEach((item) => collectBooleans(item, out));
}

const BORDER_GLOW_TARGETS = [
  {
    selector: ".create-panel, .topbar, .status-strip, .side-panel, .center-panel",
    className: "glow-shell",
  },
  {
    selector: ".play-card, .talent-card, .goal-card, .codex-item, .question-card, .exam-picks, .prep-panel, .record-item, .person-card, .item-card, .shop-block",
    className: "glow-soft",
  },
  {
    selector: ".gamble-card, .gamble-console, .hidden-dice-row, .player-dice-wrap, .player-bet",
    className: "glow-gamble",
  },
];

function render() {
  app.innerHTML = view.screen === "game" && state ? renderGame() : renderCreate();
  initBorderGlow();
  initProfileCards();
}

function initBorderGlow() {
  BORDER_GLOW_TARGETS.forEach(({ selector, className }) => {
    app.querySelectorAll(selector).forEach((el) => {
      el.classList.add("border-glow-card", className);
      if (![...el.children].some((child) => child.classList.contains("edge-light"))) {
        const edgeLight = document.createElement("span");
        edgeLight.className = "edge-light";
        edgeLight.setAttribute("aria-hidden", "true");
        el.prepend(edgeLight);
      }
      if (el.dataset.borderGlowBound === "1") return;
      el.dataset.borderGlowBound = "1";
      el.addEventListener("pointermove", handleBorderGlowPointer);
      el.addEventListener("pointerleave", resetBorderGlowPointer);
      el.addEventListener("pointercancel", resetBorderGlowPointer);
    });
  });
}

function initProfileCards() {
  app.querySelectorAll("[data-profile-card]").forEach((card) => {
    if (card.dataset.profileBound === "1") return;
    card.dataset.profileBound = "1";
    const shell = card.querySelector(".pc-card-shell");
    if (!shell) return;
    const setPointer = (x, y) => {
      const rect = shell.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const percentX = clamp((x / rect.width) * 100);
      const percentY = clamp((y / rect.height) * 100);
      const centerX = percentX - 50;
      const centerY = percentY - 50;
      card.style.setProperty("--pointer-x", `${percentX}%`);
      card.style.setProperty("--pointer-y", `${percentY}%`);
      card.style.setProperty("--background-x", `${35 + percentX * 0.3}%`);
      card.style.setProperty("--background-y", `${35 + percentY * 0.3}%`);
      card.style.setProperty("--pointer-from-left", `${percentX / 100}`);
      card.style.setProperty("--pointer-from-top", `${percentY / 100}`);
      card.style.setProperty("--pointer-from-center", `${clamp(Math.hypot(centerX, centerY) / 50, 0, 1)}`);
      card.style.setProperty("--rotate-x", `${-(centerX / 7).toFixed(2)}deg`);
      card.style.setProperty("--rotate-y", `${(centerY / 6).toFixed(2)}deg`);
    };
    shell.addEventListener("pointerenter", (event) => {
      shell.classList.add("active", "entering");
      const rect = shell.getBoundingClientRect();
      setPointer(event.clientX - rect.left, event.clientY - rect.top);
      setTimeout(() => shell.classList.remove("entering"), 180);
    });
    shell.addEventListener("pointermove", (event) => {
      const rect = shell.getBoundingClientRect();
      setPointer(event.clientX - rect.left, event.clientY - rect.top);
    });
    shell.addEventListener("pointerleave", () => {
      shell.classList.remove("active");
      const rect = shell.getBoundingClientRect();
      setPointer(rect.width / 2, rect.height / 2);
    });
    requestAnimationFrame(() => {
      const rect = shell.getBoundingClientRect();
      setPointer(rect.width * 0.64, rect.height * 0.24);
      requestAnimationFrame(() => setPointer(rect.width / 2, rect.height / 2));
    });
  });
}

function handleBorderGlowPointer(event) {
  const card = event.currentTarget;
  const rect = card.getBoundingClientRect();
  if (!rect.width || !rect.height) return;

  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const cx = rect.width / 2;
  const cy = rect.height / 2;
  const dx = x - cx;
  const dy = y - cy;
  const kx = dx === 0 ? Infinity : cx / Math.abs(dx);
  const ky = dy === 0 ? Infinity : cy / Math.abs(dy);
  const edge = Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
  let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
  if (angle < 0) angle += 360;

  card.style.setProperty("--edge-proximity", `${(edge * 100).toFixed(3)}`);
  card.style.setProperty("--cursor-angle", `${angle.toFixed(3)}deg`);
}

function resetBorderGlowPointer(event) {
  event.currentTarget.style.setProperty("--edge-proximity", "0");
}

function initLightfallBackground() {
  const canvas = document.getElementById("lightfall-bg");
  if (!canvas) return;

  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: true,
    depth: false,
    stencil: false,
    preserveDrawingBuffer: true,
  });
  if (!gl) {
    canvas.classList.add("lightfall-bg--fallback");
    return;
  }

  const vertexShader = `
    attribute vec2 aPosition;
    varying vec2 vUv;

    void main() {
      vUv = aPosition * 0.5 + 0.5;
      gl_Position = vec4(aPosition, 0.0, 1.0);
    }
  `;

  const fragmentShader = `
    precision highp float;

    uniform vec3 iResolution;
    uniform vec2 iMouse;
    uniform float iTime;
    uniform vec3 uColor0;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uColor3;
    uniform vec3 uColor4;
    uniform vec3 uColor5;
    uniform vec3 uColor6;
    uniform vec3 uColor7;
    uniform int uColorCount;
    uniform vec3 uBgColor;
    uniform vec3 uMouseColor;
    uniform float uSpeed;
    uniform int uStreakCount;
    uniform float uStreakWidth;
    uniform float uStreakLength;
    uniform float uGlow;
    uniform float uDensity;
    uniform float uTwinkle;
    uniform float uZoom;
    uniform float uBgGlow;
    uniform float uOpacity;
    uniform float uMouseEnabled;
    uniform float uMouseStrength;
    uniform float uMouseRadius;

    varying vec2 vUv;

    vec3 palette(float h) {
      int count = uColorCount;
      if (count < 1) count = 1;
      int idx = int(floor(clamp(h, 0.0, 0.999999) * float(count)));
      if (idx <= 0) return uColor0;
      if (idx == 1) return uColor1;
      if (idx == 2) return uColor2;
      if (idx == 3) return uColor3;
      if (idx == 4) return uColor4;
      if (idx == 5) return uColor5;
      if (idx == 6) return uColor6;
      return uColor7;
    }

    vec3 tanhv(vec3 x) {
      vec3 e = exp(-2.0 * x);
      return (1.0 - e) / (1.0 + e);
    }

    vec2 sceneC(vec2 frag, vec2 r) {
      vec2 P = (frag + frag - r) / r.x;
      float z = 0.0;
      float d = 1e3;
      vec4 O = vec4(0.0);
      for (int k = 0; k < 39; k++) {
        if (d <= 1e-4) break;
        O = z * normalize(vec4(P, uZoom, 0.0)) - vec4(0.0, 4.0, 1.0, 0.0) / 4.5;
        d = 1.0 - sqrt(length(O * O));
        z += d;
      }
      return vec2(O.x, atan(O.z, O.y));
    }

    void mainImage(out vec4 o, vec2 C) {
      vec2 r = iResolution.xy;
      vec2 uv0 = (C + C - r) / r.x;
      float T = 0.1 * iTime * uSpeed + 9.0;
      float angRings = max(1.0, floor(6.28318530718 * max(uDensity, 0.05) + 0.5));
      vec2 Y = vec2(5e-3, 6.28318530718 / angRings);

      vec2 c0 = sceneC(C, r);
      vec2 cdx = sceneC(C + vec2(1.0, 0.0), r);
      vec2 cdy = sceneC(C + vec2(0.0, 1.0), r);
      vec2 dCx = cdx - c0;
      vec2 dCy = cdy - c0;
      dCx.y -= 6.28318530718 * floor(dCx.y / 6.28318530718 + 0.5);
      dCy.y -= 6.28318530718 * floor(dCy.y / 6.28318530718 + 0.5);
      vec2 fw = abs(dCx) + abs(dCy);
      C = c0;

      vec2 P = vec2(2.0, 1.0) * uv0 - (r / r.x) * vec2(0.0, 1.0);
      vec4 O = vec4(uBgColor * 90.0 * uBgGlow / (1e3 * dot(P, P) + 6.0), 0.0);

      float mGlow = 0.0;
      if (uMouseEnabled > 0.5) {
        vec2 mN = (iMouse + iMouse - r) / r.x;
        float md = length(uv0 - mN);
        mGlow = exp(-md * md / max(uMouseRadius * uMouseRadius, 1e-4)) * uMouseStrength;
        O.rgb += uMouseColor * mGlow * 0.25;
      }

      float zr = 5e-4 * uStreakWidth;
      vec2 rr = vec2(max(length(fw), 1e-5));
      float tail = 19.0 / max(uStreakLength, 0.05);

      for (int m = 0; m < 16; m++) {
        if (m >= uStreakCount) break;
        float jf = float(m) + 1.0;
        float ic = fract(sin(dot(vec2(jf, floor(C.x / Y.x + 0.5)), vec2(7.0, 11.0)) * 73.0));
        vec2 Pp = C - (T + T * ic) * vec2(0.0, 1.0);
        Pp -= floor(Pp / Y + 0.5) * Y;
        float h = fract(8663.0 * ic);
        vec3 col = palette(h);
        float weight = mix(1.5, 1.0 + sin(T + 7.0 * h + 4.0), uTwinkle);
        weight *= 1.0 + mGlow * 2.0;
        vec2 inner = vec2(length(max(Pp, vec2(-1.0, 0.0))), length(Pp) - zr) - zr;
        vec2 sm = vec2(1.0) - smoothstep(-rr, rr, inner);
        O.rgb += dot(sm, vec2(exp(tail * Pp.y), 3.0)) * col * weight;
        C.x += Y.x / 8.0;
      }

      vec3 colr = sqrt(tanhv(max(O.rgb * uGlow - vec3(0.04, 0.08, 0.02), 0.0)));
      o = vec4(colr, uOpacity);
    }

    void main() {
      vec4 color;
      mainImage(color, vUv * iResolution.xy);
      gl_FragColor = color;
    }
  `;

  const program = createLightfallProgram(gl, vertexShader, fragmentShader);
  if (!program) {
    canvas.classList.add("lightfall-bg--fallback");
    return;
  }

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

  const positionLocation = gl.getAttribLocation(program, "aPosition");
  const uniformLocations = {
    resolution: gl.getUniformLocation(program, "iResolution"),
    mouse: gl.getUniformLocation(program, "iMouse"),
    time: gl.getUniformLocation(program, "iTime"),
    colors: Array.from({ length: 8 }, (_, index) => gl.getUniformLocation(program, `uColor${index}`)),
    colorCount: gl.getUniformLocation(program, "uColorCount"),
    bgColor: gl.getUniformLocation(program, "uBgColor"),
    mouseColor: gl.getUniformLocation(program, "uMouseColor"),
    speed: gl.getUniformLocation(program, "uSpeed"),
    streakCount: gl.getUniformLocation(program, "uStreakCount"),
    streakWidth: gl.getUniformLocation(program, "uStreakWidth"),
    streakLength: gl.getUniformLocation(program, "uStreakLength"),
    glow: gl.getUniformLocation(program, "uGlow"),
    density: gl.getUniformLocation(program, "uDensity"),
    twinkle: gl.getUniformLocation(program, "uTwinkle"),
    zoom: gl.getUniformLocation(program, "uZoom"),
    bgGlow: gl.getUniformLocation(program, "uBgGlow"),
    opacity: gl.getUniformLocation(program, "uOpacity"),
    mouseEnabled: gl.getUniformLocation(program, "uMouseEnabled"),
    mouseStrength: gl.getUniformLocation(program, "uMouseStrength"),
    mouseRadius: gl.getUniformLocation(program, "uMouseRadius"),
  };
  const lightfall = {
    colors: ["#ffe2a8", "#6dd6bf", "#cf8d55", "#9fb6ff"],
    backgroundColor: "#2f7d6d",
    speed: 0.68,
    streakCount: 5,
    streakWidth: 0.92,
    streakLength: 1.05,
    glow: 0.68,
    density: 0.62,
    twinkle: 0.58,
    zoom: 3.05,
    backgroundGlow: 0.58,
    opacity: 0.82,
    mouseInteraction: true,
    mouseStrength: 0.45,
    mouseRadius: 0.9,
    mouseDampening: 0.15,
  };
  const colorData = prepLightfallColors(lightfall.colors);
  const backgroundColor = hexToLightfallRgb(lightfall.backgroundColor);
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const mouse = { current: [0, 0], target: [0, 0], hasPointer: false };
  let dpr = Math.min(window.devicePixelRatio || 1, 1.6);
  let lastTime = performance.now();
  let frameId = 0;

  gl.disable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.6);
    const width = Math.max(1, Math.floor(canvas.clientWidth * dpr));
    const height = Math.max(1, Math.floor(canvas.clientHeight * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
      if (!mouse.hasPointer) {
        mouse.current = [width / 2, height / 2];
        mouse.target = [width / 2, height / 2];
      }
    }
  }

  function updatePointer(event) {
    const rect = canvas.getBoundingClientRect();
    mouse.hasPointer = true;
    mouse.target = [(event.clientX - rect.left) * dpr, (rect.height - (event.clientY - rect.top)) * dpr];
    if (lightfall.mouseDampening <= 0) mouse.current = [...mouse.target];
  }

  function draw(now = performance.now()) {
    resize();
    const delta = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    if (lightfall.mouseDampening > 0) {
      const factor = Math.min(1, 1 - Math.exp(-delta / Math.max(lightfall.mouseDampening, 0.0001)));
      mouse.current[0] += (mouse.target[0] - mouse.current[0]) * factor;
      mouse.current[1] += (mouse.target[1] - mouse.current[1]) * factor;
    }

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.uniform3f(uniformLocations.resolution, canvas.width, canvas.height, 1);
    gl.uniform2f(uniformLocations.mouse, mouse.current[0], mouse.current[1]);
    gl.uniform1f(uniformLocations.time, reducedMotion ? 0 : now * 0.001);
    uniformLocations.colors.forEach((location, index) => gl.uniform3fv(location, colorData.arr[index]));
    gl.uniform1i(uniformLocations.colorCount, colorData.count);
    gl.uniform3fv(uniformLocations.bgColor, backgroundColor);
    gl.uniform3fv(uniformLocations.mouseColor, colorData.avg);
    gl.uniform1f(uniformLocations.speed, lightfall.speed);
    gl.uniform1i(uniformLocations.streakCount, Math.max(1, Math.min(16, Math.round(lightfall.streakCount))));
    gl.uniform1f(uniformLocations.streakWidth, lightfall.streakWidth);
    gl.uniform1f(uniformLocations.streakLength, lightfall.streakLength);
    gl.uniform1f(uniformLocations.glow, lightfall.glow);
    gl.uniform1f(uniformLocations.density, lightfall.density);
    gl.uniform1f(uniformLocations.twinkle, lightfall.twinkle);
    gl.uniform1f(uniformLocations.zoom, lightfall.zoom);
    gl.uniform1f(uniformLocations.bgGlow, lightfall.backgroundGlow);
    gl.uniform1f(uniformLocations.opacity, lightfall.opacity);
    gl.uniform1f(uniformLocations.mouseEnabled, lightfall.mouseInteraction ? 1 : 0);
    gl.uniform1f(uniformLocations.mouseStrength, lightfall.mouseStrength);
    gl.uniform1f(uniformLocations.mouseRadius, lightfall.mouseRadius);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    canvas.dataset.lightfallReady = "1";

    if (!reducedMotion) frameId = window.requestAnimationFrame(draw);
  }

  window.addEventListener("resize", () => {
    if (reducedMotion) draw();
  }, { passive: true });
  window.addEventListener("pointermove", updatePointer, { passive: true });
  canvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    if (frameId) window.cancelAnimationFrame(frameId);
    canvas.classList.add("lightfall-bg--fallback");
  });
  draw();
}

function createLightfallProgram(gl, vertexSource, fragmentSource) {
  const vertexShader = compileLightfallShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = compileLightfallShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  if (!vertexShader || !fragmentShader) return null;

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  return program;
}

function compileLightfallShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
}

function prepLightfallColors(input) {
  const base = (input?.length ? input : ["#a6c8ff", "#5227ff", "#ff9ffc"]).slice(0, 8);
  const arr = [];
  for (let i = 0; i < 8; i += 1) arr.push(hexToLightfallRgb(base[Math.min(i, base.length - 1)]));
  const avg = [0, 0, 0];
  for (let i = 0; i < base.length; i += 1) {
    avg[0] += arr[i][0];
    avg[1] += arr[i][1];
    avg[2] += arr[i][2];
  }
  avg[0] /= base.length;
  avg[1] /= base.length;
  avg[2] /= base.length;
  return { arr, count: base.length, avg };
}

function hexToLightfallRgb(hex) {
  const value = String(hex || "#000000").replace("#", "").padEnd(6, "0");
  return [
    parseInt(value.slice(0, 2), 16) / 255,
    parseInt(value.slice(2, 4), 16) / 255,
    parseInt(value.slice(4, 6), 16) / 255,
  ];
}

initLightfallBackground();
render();

function renderCreate() {
  const meta = loadSlotMeta();
  const hasSave = meta.some((slot) => slot !== null);
  return `
    <main class="app-shell create-shell">
      <section class="create-panel">
        <div class="brand-row">
          <div>
            <p class="eyebrow">古代人生 Web</p>
            <h1>新的一生</h1>
          </div>
          ${hasSave ? `<button class="ghost-btn" data-action="continue-save">继续</button>` : ""}
        </div>

        <div class="form-grid">
          <label class="field">
            <span>性别</span>
            <span class="segmented">
              <button class="${draft.gender === "male" ? "active" : ""}" data-gender="male">男</button>
              <button class="${draft.gender === "female" ? "active" : ""}" data-gender="female">女</button>
            </span>
          </label>
          <label class="field">
            <span>姓名</span>
            <input data-field="name" value="${escapeHtml(draft.family + draft.given)}">
          </label>
          <label class="field">
            <span>出身</span>
            <select data-field="difficulty">
              ${["普通", "富贵", "寒门"].map((item) => `<option ${item === draft.difficulty ? "selected" : ""}>${item}</option>`).join("")}
            </select>
          </label>
        </div>

        <section class="talent-area">
          <div class="section-title">
            <h2>天赋</h2>
            <button class="text-btn" data-action="reroll">重抽</button>
          </div>
          <div class="talent-grid">
            ${talentCard(draft.coreTalent, "命格")}
            ${draft.talents.map((talent) => talentCard(talent, "天赋")).join("")}
          </div>
        </section>

        <div class="create-actions">
          <button class="secondary-btn" data-action="random-name">换名字</button>
          <button class="primary-btn" data-action="start-life">开始人生</button>
        </div>
      </section>
    </main>`;
}

function talentCard(item, type) {
  if (!item) return `<article class="talent-card empty"><span>${type}</span><strong>未定</strong></article>`;
  return `
    <article class="talent-card">
      <span>${escapeHtml(type)}</span>
      <strong>${escapeHtml(item.name)}</strong>
      <p>${formatText(item.desc || "")}</p>
    </article>`;
}

function renderGame() {
  return `
    <main class="app-shell game-shell">
      <header class="topbar">
        <div class="identity">
          <button class="avatar profile-trigger" data-overlay="profile" title="资料">${profileAvatarHtml("top-avatar-img")}</button>
          <div>
            <h1>${escapeHtml(state.name)}</h1>
            <p>${state.age}岁 · ${escapeHtml(state.location)} · ${escapeHtml(state.difficulty)}</p>
          </div>
        </div>
        <div class="top-actions">
          <button class="shortcut-btn guide-shortcut" data-action="open-onboarding" title="新手引导">
            ${icon("MainBook", "新手引导")}
            <span>引导</span>
          </button>
          <button class="shortcut-btn sfx-toggle" data-action="toggle-sfx" title="${SFX.isMuted() ? "开启音效" : "关闭音效"}">
            <span class="sfx-icon">${SFX.isMuted() ? "🔇" : "🔊"}</span>
            <span>${SFX.isMuted() ? "静音" : "音效"}</span>
          </button>
          ${TOP_SHORTCUTS.map((item) => `
            <button class="shortcut-btn" data-shortcut="${item.id}" title="${escapeHtml(item.label)}">
              ${icon(item.icon, item.label)}
              <span>${escapeHtml(item.label)}</span>
            </button>`).join("")}
        </div>
      </header>

      <section class="status-strip">
        ${resourcePill("钱财", moneyText(state.stats.money, { compact: true }))}
        ${resourcePill("营生", state.career?.name || "无")}
        ${state.prisonYears > 0 ? resourcePill("牢狱", `余刑 ${state.prisonYears} 年`, "bad") : ""}
        ${state.diseases.map((item) => resourcePill("病症", item, "bad")).join("")}
        ${state.tags.slice(0, 4).map((item) => resourcePill("记号", item)).join("")}
      </section>

      <div class="game-layout">
        <aside class="side-panel stats-panel">
          <div class="section-title"><h2>状态</h2></div>
          <div class="stat-list">${STAT_DEFS.map(([key]) => statRow(key)).join("")}</div>
          <div class="delta-list">${deltaHtml()}</div>
        </aside>

        <section class="center-panel">
          ${centerContent()}
        </section>

        <aside class="side-panel detail-panel">
          ${tabBar()}
          ${tabContent()}
        </aside>
      </div>
      ${overlayView()}
    </main>`;
}

function overlayView() {
  if (!view.overlay) return "";
  if (view.overlay === "onboarding") return onboardingOverlay();
  if (view.overlay === "profile") return profileOverlay();
  if (view.overlay === "surprise") return surpriseOverlay();
  return "";
}

function onboardingOverlay() {
  const firstStep = state.age < 1
    ? "先点“开始第一年”，让第一件人生事件发生。"
    : state.age < MAIN_EXAM_MIN_AGE
      ? "先关注体魄、学识和家中关系，等 15 岁后再选营生或科举。"
      : "可以先去“营生”谋一份差事，或去“书院”参加科举。";
  const firstAction = state.age < 1
    ? `<button class="primary-btn" data-action="onboarding-next-year">开始第一年</button>`
    : `<button class="primary-btn" data-action="finish-onboarding">知道了</button>`;
  return `
    <section class="game-overlay onboarding-overlay">
      <article class="profile-modal onboarding-modal">
        <button class="profile-close" data-action="finish-onboarding" title="关闭">×</button>
        <div class="onboarding-hero">
          <div class="onboarding-seal">${profileAvatarHtml("onboarding-avatar")}</div>
          <div>
            <p class="eyebrow">新手引导</p>
            <h2>你是 ${escapeHtml(state.name)}</h2>
            <p>你刚来到 ${escapeHtml(state.location)}，出身为${escapeHtml(state.difficulty)}。这不是单线剧情，而是一段会被选择、年龄、亲友和钱财一起推动的人生。</p>
          </div>
        </div>

        <div class="onboarding-grid">
          <section class="onboarding-card">
            <strong>我是谁</strong>
            <p>你会从幼年开始长大，经历家事、读书、交友、营生、婚育、仕途和死亡。每一年都会留下记录。</p>
          </section>
          <section class="onboarding-card">
            <strong>能干什么</strong>
            <p>你可以经营属性，照顾亲友，买房置业，参加科举，当官办事，也能去瓦舍、博坊、雅戏和行商押镖。</p>
          </section>
          <section class="onboarding-card highlight">
            <strong>第一步做什么</strong>
            <p>${escapeHtml(firstStep)}</p>
          </section>
        </div>

        <ol class="onboarding-steps">
          <li><b>看状态</b><span>左侧是心情、体魄、学识等核心属性，体魄太低会有生命风险。</span></li>
          <li><b>点中间事件</b><span>人生事件会给你选择，不同选项会改属性、钱财和关系。</span></li>
          <li><b>用右侧页签</b><span>右侧能查看命册、亲友、背包、账本和资料，后面会越来越重要。</span></li>
          <li><b>长大后解锁</b><span>15 岁后开放营生和童试，18 岁后会开放更多成人活动。</span></li>
        </ol>

        <div class="onboarding-actions">
          <button class="secondary-btn" data-action="finish-onboarding">以后再看</button>
          ${firstAction}
        </div>
      </article>
    </section>`;
}

function profileOverlay() {
  const born = state.biography.match(/生于([^，。]+)/)?.[1] || state.location;
  return `
    <section class="game-overlay">
      <article class="profile-modal">
        <button class="profile-close" data-action="close-overlay" title="关闭">×</button>
        <div class="profile-layout">
          <div class="profile-card-column">
            ${profileCard()}
            ${profileAvatarPicker()}
          </div>
          <div class="profile-detail-sheet">
            <p class="eyebrow">资料</p>
            <h2>${escapeHtml(state.name)}</h2>
            <div class="profile-lines">
              ${infoLine("性别", state.gender === "female" ? "女" : "男")}
              ${infoLine("年龄", `${state.age}岁`)}
              ${infoLine("生于", born)}
              ${infoLine("当前位置", state.location)}
              ${infoLine("名望", String(Math.round(state.stats.favorability || 0)))}
            </div>
            <div class="profile-stat-list">${STAT_DEFS.map(([key]) => statRow(key)).join("")}</div>
            <button class="primary-btn" data-action="close-overlay">确定</button>
          </div>
        </div>
      </article>
    </section>`;
}

function profileAvatarHtml(className = "profile-avatar-img") {
  const avatar = avatarOptions(state.gender).includes(state.profileAvatar) ? state.profileAvatar : defaultProfileAvatar(state.gender);
  if (avatar) return `<img class="${escapeHtml(className)}" src="${escapeHtml(avatar)}" alt="${escapeHtml(state.name)}" loading="eager">`;
  const fallback = icon(state.gender === "female" ? "Relationship2" : "Relationship1", state.name);
  return fallback || `<span>${escapeHtml(state.gender === "female" ? "女" : "男")}</span>`;
}

function profileAvatarPicker() {
  const options = avatarOptions(state.gender);
  return `
    <section class="profile-avatar-picker">
      <div class="section-title">
        <h2>头像</h2>
        <strong>${options.length} 款</strong>
      </div>
      <div class="profile-avatar-options">
        ${options.map((path, index) => `
          <button class="profile-avatar-choice ${path === state.profileAvatar ? "active" : ""}" data-profile-avatar="${escapeHtml(path)}" title="头像 ${index + 1}">
            <img src="${escapeHtml(path)}" alt="头像 ${index + 1}" loading="eager">
          </button>`).join("")}
      </div>
    </section>`;
}

function profileCard() {
  const title = state.career?.name || (state.exam.rank >= 0 ? EXAM_TITLES[state.exam.rank] : "布衣");
  const handle = `${state.lineage?.familyName || state.name.slice(0, 1)}氏第${Math.max(1, Number(state.lineage?.generation) || 1)}代`;
  const status = state.prisonYears > 0 ? `牢狱余刑 ${state.prisonYears} 年` : state.diseases.length ? state.diseases[0] : statDesc("mood", state.stats.mood || 0);
  const statKeys = ["mood", "physique", "knowledge"];
  const avatarImage = profileAvatarHtml("profile-avatar-img");
  const miniAvatarImage = profileAvatarHtml("profile-mini-avatar-img");
  return `
    <div class="pc-card-wrapper dynasty-profile-card" data-profile-card>
      <div class="pc-behind"></div>
      <div class="pc-card-shell">
        <section class="pc-card">
          <div class="pc-inside">
            <div class="pc-shine"></div>
            <div class="pc-glare"></div>
            <div class="pc-content pc-avatar-content">
              <div class="pc-avatar-emblem ${state.gender === "female" ? "female" : ""}">
                ${avatarImage}
              </div>
              <div class="pc-user-info">
                <div class="pc-user-details">
                  <div class="pc-mini-avatar">${miniAvatarImage}</div>
                  <div class="pc-user-text">
                    <div class="pc-handle">@${escapeHtml(handle)}</div>
                    <div class="pc-status">${escapeHtml(status)}</div>
                  </div>
                </div>
                <button class="pc-contact-btn" data-action="close-overlay" type="button">收起</button>
              </div>
            </div>
            <div class="pc-content">
              <div class="pc-details">
                <h3>${escapeHtml(state.name)}</h3>
                <p>${escapeHtml(title)}</p>
                <div class="pc-stat-badges">
                  ${statKeys.map((key) => `<span>${escapeHtml(STAT_LABELS[key])}<b>${Math.round(state.stats[key] || 0)}</b></span>`).join("")}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>`;
}

function surpriseOverlay() {
  const gift = state.pendingSurprise || {};
  return `
    <section class="game-overlay">
      <article class="profile-modal surprise-modal">
        <p class="eyebrow">${escapeHtml(gift.category || "惊喜")}</p>
        <h2>${escapeHtml(gift.title || "小事")}</h2>
        <div class="result-illustration">${icon(gift.icon || "FamilyIcon", gift.title || "惊喜")}</div>
        <p>${formatText(gift.text || "")}</p>
        <div class="delta-list result-deltas">${deltaHtml()}</div>
        <button class="primary-btn" data-action="close-surprise">确定</button>
      </article>
    </section>`;
}

function centerContent() {
  if (state.dead) return deathView();
  if (state.pendingCaravan) return caravanRunView();
  if (state.eventResult) return eventResultView();
  if (state.currentEvent) return eventView(state.currentEvent);
  if (view.page === "home") return homeView();
  if (view.page === "place") return placeView();
  if (view.page === "assets") return assetsView();
  if (view.page === "relations") return relationsView();
  if (view.page === "travel") return travelView();
  if (view.page === "backpack") return backpackView();
  if (view.page === "ledger") return ledgerView();
  if (view.page === "menu") return menuView();
  if (view.page === "save-manager") return saveManagerView();
  if (view.page === "codex") return codexView();
  if (view.page === "gamble") return gambleView();
  if (view.page === "miniGames") return miniGamesView();
  if (view.page === "courtesanContest") return courtesanContestView();
  if (view.page === "activity") return activityView();
  if (view.page === "exam") return examView();
  return overviewView();
}

function resourcePill(label, value, tone = "") {
  return `<span class="resource-pill ${tone}"><b>${escapeHtml(label)}</b>${escapeHtml(value)}</span>`;
}

function statRow(key) {
  const value = Math.round(state.stats[key] || 0);
  const desc = statDesc(key, value);
  return `
    <div class="stat-row">
      <div class="stat-head">
        <span>${icon(STAT_ICONS[key], STAT_LABELS[key])}${STAT_LABELS[key]}</span>
        <b>${value}</b>
      </div>
      <div class="meter"><i style="width:${clamp(value)}%"></i></div>
      <small>${escapeHtml(desc)}</small>
    </div>`;
}

function statDesc(key, value) {
  const list = STAT_DESC[key] || ["低", "中", "良", "高"];
  if (value < 25) return list[0];
  if (value < 55) return list[1];
  if (value < 82) return list[2];
  return list[3];
}

function deltaHtml() {
  if (!state.lastDeltas?.length) return "";
  return state.lastDeltas
    .slice(0, 8)
    .map((item) => {
      const negative = item.negative || (typeof item.value === "number" && item.value < 0);
      const value = item.stat === "money" && typeof item.value === "number" ? moneyText(item.value, { signed: true }) : typeof item.value === "number" ? `${item.value > 0 ? "+" : ""}${item.value}` : item.value;
      return `<span class="delta ${negative ? "bad" : ""}">${escapeHtml(item.label)} ${escapeHtml(value)}</span>`;
    })
    .join("");
}

function overviewView() {
  const phase = lifePhase();
  const goals = nextGoals(3);
  const generation = Math.max(1, Number(state.lineage?.generation) || 1);
  return `
    <article class="play-card life-scroll">
      <p class="eyebrow">流年 · ${escapeHtml(phase.name)} · 第${generation}代</p>
      <h2>${state.age}岁</h2>
      <p>${state.age === 0 ? escapeHtml(state.biography) : latestYearText()}</p>
      <div class="life-brief">
        <span><b>今岁重心</b>${escapeHtml(phase.focus)}</span>
        <span><b>家族传承</b>${escapeHtml(state.lineage?.familyName || state.name.slice(0, 1))}氏第${generation}代</span>
        <span><b>命格评分</b>${lifeScore()} · ${escapeHtml(lifeGrade())}</span>
      </div>
      <p class="life-tip">${escapeHtml(lifeInsight())}</p>
      <div class="main-actions">
        <button class="primary-btn year-btn" data-action="next-year" ${state.eventResult ? "disabled" : ""}>下一年</button>
        <button class="secondary-btn" data-page="place" data-place="activities">安排活动</button>
      </div>
    </article>
    <section class="goal-strip">
      ${goals.map((goal) => `
        <article class="goal-card">
          ${icon(goal.icon, goal.title)}
          <strong>${escapeHtml(goal.title)}</strong>
          <small>${escapeHtml(goal.advice)}</small>
        </article>`).join("") || `<article class="goal-card complete"><strong>目标已满</strong><small>这一世大多经营妥当，继续补足命册即可。</small></article>`}
    </section>
    <section class="door-grid">
      ${MAIN_DOORS.map((door) => `
        <button class="door-btn" data-door="${door.id}">
          ${icon(door.icon, door.label)}
          <span>${escapeHtml(door.label)}</span>
        </button>`).join("")}
    </section>
    ${recentLog()}`;
}

function latestYearText() {
  if (state.prisonYears > 0) return `你仍在牢狱之中，余刑 ${state.prisonYears} 年。`;
  const latest = state.log.find((item) => item.age === state.age) || state.log[0];
  return latest?.text || "这一年暂未有大事临门。你可以安排活动，或让人生继续向前。";
}

function activityView() {
  const activity = getActivity(view.activityId) || ACTIVITIES[0];
  const blocked = state.dead || !!state.currentEvent || !!state.pendingCaravan || state.prisonYears > 0;
  return `
    <article class="play-card activity-card">
      <p class="eyebrow">活动</p>
      <h2>${escapeHtml(activity.label)}</h2>
      <p>${escapeHtml(activity.text)}</p>
      <div class="activity-meta">
        ${(activity.buckets || []).map((bucket) => `<span>${activityBucketName(bucket)}</span>`).join("")}
      </div>
      <div class="main-actions">
        <button class="primary-btn" data-action="start-activity" data-activity-id="${escapeHtml(activity.id)}" ${blocked ? "disabled" : ""}>开始</button>
        ${activity.exam ? `<button class="secondary-btn" data-action="open-exam" ${canOpenExam() ? "" : "disabled"}>科举考试</button>` : ""}
        <button class="ghost-btn" data-action="back-main">返回</button>
      </div>
      ${activity.exam ? examStatusNote() : ""}
    </article>
    ${activityEventPreview(activity)}`;
}

function courtesanContestView() {
  const contest = normalizeCourtesanContest(state.courtesanContest);
  if (!contest) {
    return `
      <article class="play-card courtesan-card">
        <p class="eyebrow">瓦舍风月</p>
        <h2>佳丽竞选</h2>
        <p>今夜灯影未起，后楼暂无竞选。若想入席，可重新开一场。</p>
        <div class="main-actions">
          <button class="primary-btn" data-action="courtesan-contest-start">入席开场</button>
          <button class="ghost-btn" data-action="back-places">返回活动</button>
        </div>
      </article>`;
  }
  const round = COURTESAN_ROUNDS[contest.round];
  const ranking = [...contest.candidates].sort((a, b) => b.score - a.score);
  const leader = ranking[0];
  const finished = contest.round >= COURTESAN_ROUNDS.length;
  return `
    <article class="play-card courtesan-card">
      <div class="courtesan-hero">
        <div>
          <p class="eyebrow">瓦舍风月</p>
          <h2>佳丽竞选</h2>
          <p>${finished ? "三轮已毕，花魁将定。" : `${round.label}：${round.note}`}</p>
        </div>
        <div class="courtesan-preview">
          <span>花魁预选</span>
          <strong>${escapeHtml(leader?.name || "未定")}</strong>
          <small>${leader ? `${leader.score} 分 · ${leader.specialty}` : "尚未开评"}</small>
        </div>
      </div>
      <section class="score-grid courtesan-summary">
        ${scoreTile("轮次", `${Math.min(contest.round + 1, COURTESAN_ROUNDS.length)}/${COURTESAN_ROUNDS.length}`)}
        ${scoreTile("入席", moneyText(contest.entranceCost))}
        ${scoreTile("赠礼", moneyText(contest.giftCost))}
      </section>
      <section class="courtesan-list">
        ${ranking.map((candidate, index) => courtesanCandidateCard(candidate, index, round, finished, contest.giftCost)).join("")}
      </section>
      <section class="courtesan-log">
        <strong>席间记录</strong>
        ${(contest.log || []).slice().reverse().map((item) => `<p>${escapeHtml(item)}</p>`).join("")}
      </section>
      <div class="main-actions">
        ${finished ? `<button class="primary-btn" data-action="courtesan-contest-finish">评定花魁</button>` : ""}
        <button class="ghost-btn" data-action="back-places">返回瓦舍</button>
      </div>
    </article>`;
}

function courtesanCandidateCard(candidate, index, round, finished, giftCost) {
  const stats = [
    ["才艺", candidate.talent],
    ["机智", candidate.wit],
    ["品德", candidate.virtue],
    ["姿容", candidate.looks],
  ];
  const rankLabel = index === 0 ? "花魁预选" : `第 ${index + 1} 名`;
  const actionDisabled = round?.id === "gift" && state.stats.money < giftCost;
  return `
    <article class="courtesan-person ${index === 0 ? "leading" : ""}">
      <div class="courtesan-avatar">
        ${candidate.portrait ? `<img class="courtesan-portrait" src="${escapeHtml(candidate.portrait)}" alt="${escapeHtml(candidate.name)}" loading="eager">` : icon(candidate.icon || "FlowerChiefTitle", candidate.specialty)}
      </div>
      <div class="courtesan-body">
        <header>
          <div>
            <small>${escapeHtml(rankLabel)} · ${candidate.age} 岁</small>
            <h3>${escapeHtml(candidate.name)}</h3>
          </div>
          <b>${candidate.score} 分</b>
        </header>
        <p>${escapeHtml(candidate.background)}</p>
        <p class="courtesan-talent">${escapeHtml(candidate.specialty)} · ${escapeHtml(candidate.specialtyText)}</p>
        <div class="courtesan-bars">
          ${stats.map(([label, value]) => `
            <span><em>${escapeHtml(label)}</em><i><b style="width:${clampNumber(value, 0, 100, 0)}%"></b></i><strong>${value}</strong></span>
          `).join("")}
        </div>
        <div class="courtesan-card-foot">
          <span>拉拢度 ${candidate.affection}</span>
          ${finished || !round ? `<span>待评定</span>` : `<button class="primary-btn" data-courtesan-action="${round.id}" data-courtesan-id="${escapeHtml(candidate.id)}" ${actionDisabled ? "disabled" : ""}>${escapeHtml(round.action)}${round.id === "gift" ? ` · ${moneyText(giftCost)}` : ""}</button>`}
        </div>
      </div>
    </article>`;
}

function eventResultView() {
  const result = state.eventResult || {};
  return `
    <article class="play-card result-card">
      <p class="eyebrow">结果</p>
      <h2>${escapeHtml(result.title || "结果")}</h2>
      <div class="result-illustration">${icon(result.icon || "MainBook", result.title || "结果")}</div>
      <p>${formatText(result.text || "事情有了结果。")}</p>
      ${result.caravan ? caravanResultHtml(result.caravan) : ""}
      <div class="delta-list result-deltas">${deltaHtml()}</div>
      <button class="primary-btn" data-action="finish-result">点击继续</button>
    </article>`;
}

function caravanRunView() {
  const run = normalizeCaravanRun(state.pendingCaravan);
  if (!run) return overviewView();
  const route = caravanRouteById(run.routeId);
  if (run.index >= run.events.length) {
    return `
      <article class="play-card caravan-run-card">
        <p class="eyebrow">押镖途中 · ${escapeHtml(route.label)}</p>
        <h2>抵达交镖</h2>
        <p>车队已经抵达终点，只待清点货物、结算镖银。</p>
        <section class="caravan-status">
          ${scoreTile("路程", `${run.events.length}/${run.events.length}`)}
          ${scoreTile("货物", `${Math.round(run.cargo)}%`)}
          ${scoreTile("失手", `${run.failures}次`)}
          ${scoreTile("受伤", `${run.injury}`)}
        </section>
        ${caravanHistoryHtml(run.history)}
        <div class="main-actions"><button class="primary-btn" data-caravan-choice="finish">交镖结算</button></div>
      </article>`;
  }
  const event = caravanEventById(run.events[run.index]);
  const progressText = `${Math.min(run.index + 1, run.events.length)}/${run.events.length}`;
  const choices = caravanChoiceDefinitions(event, run, route);
  return `
    <article class="play-card caravan-run-card">
      <p class="eyebrow">押镖途中 · ${escapeHtml(route.label)}</p>
      <h2>${escapeHtml(event.title)}</h2>
      <p>${escapeHtml(caravanEventIntro(event, route))}</p>
      <section class="caravan-status">
        ${scoreTile("路程", progressText)}
        ${scoreTile("货物", `${Math.round(run.cargo)}%`)}
        ${scoreTile("风险", `${run.routeRisk}`)}
        ${scoreTile("受伤", `${run.injury}`)}
      </section>
      <section class="caravan-event-box">
        <strong>${escapeHtml(event.title)}</strong>
        <span>${escapeHtml(caravanEventHint(event))}</span>
      </section>
      <div class="caravan-choice-grid">
        ${choices.map((choice) => `
          <button class="caravan-choice" data-caravan-choice="${escapeHtml(choice.id)}">
            <b>${escapeHtml(choice.label)}</b>
            <span>${escapeHtml(choice.safe ? "稳妥" : `${STAT_LABELS[choice.stat]}检定`)}</span>
            <small>${escapeHtml(choice.note)}</small>
          </button>`).join("")}
      </div>
      ${caravanHistoryHtml(run.history)}
    </article>`;
}

function caravanEventIntro(event, route) {
  const routeText = route.risk >= 60 ? "这一路不是寻常货色，车队里的伙计都绷着脸。" : route.risk >= 40 ? "路途渐远，风声也杂了起来。" : "路虽不远，镖车上路仍不能掉以轻心。";
  return `${routeText}${event.title}当前挡在前头，你要决定如何处置。`;
}

function caravanEventHint(event) {
  return {
    bandit: "山贼未必真敢动手，但一旦露怯，货和人都可能折损。",
    weather: "天时不顺，强行赶路可能伤车马；绕路则会误时。",
    checkpoint: "文书、口舌和一点银钱，往往比刀更好用。",
    merchant: "货主临时变卦，压价或拖延都可能影响结算。",
    inn: "野店消息真假难辨，听错一句就可能绕进险路。",
  }[event.id] || "途中生变，谨慎选择。";
}

function caravanHistoryHtml(history = []) {
  const items = [...history].reverse().slice(0, 6);
  if (!items.length) return "";
  return `
    <section class="caravan-history">
      <h3>途中记录</h3>
      ${items.map((item) => `
        <article class="${item.ok ? "" : "bad"}">
          <strong>${escapeHtml(item.event)} · ${escapeHtml(item.choice)}</strong>
          <span>${escapeHtml(item.text)}</span>
          <small>货物 ${Math.round(item.cargo)}%</small>
        </article>`).join("")}
    </section>`;
}

function caravanResultHtml(summary) {
  return `
    <section class="caravan-summary">
      <div class="score-grid">
        ${scoreTile("路线", summary.route || "镖路")}
        ${scoreTile("货物", `${Math.round(summary.cargo || 0)}%`)}
        ${scoreTile("失手", `${summary.failures || 0}次`)}
        ${scoreTile("收益", summary.success ? moneyText(summary.reward || 0, { signed: true }) : `赔${moneyText(summary.compensation || 0)}`)}
      </div>
      ${caravanHistoryHtml(summary.events || [])}
    </section>`;
}

function homeView() {
  const blocked = state.dead || !!state.currentEvent || !!state.eventResult || !!state.pendingCaravan || state.prisonYears > 0;
  return `
    <article class="play-card home-card">
      <p class="eyebrow">家中</p>
      <h2>${state.age < 15 ? "庭院日常" : "持家"} </h2>
      <p>${state.age < 8 ? "年岁尚幼，家中小事也能慢慢养成性情。" : state.age < 15 ? "读书、玩耍、帮忙，都是少年时光。" : "成丁之后，家中也有账册、人情与长辈需要照看。"}</p>
      <section class="home-grid">
        ${homeActionButton("study", state.age < 8 ? "认字描红" : "家中温书", "增长学识与备考进度。", "Book", blocked)}
        ${homeActionButton("play", "出门玩耍", "舒展心情，可能结识同龄人。", "BambooHorse", blocked || state.age > 14)}
        ${homeActionButton("chores", "帮家里忙", "添些钱财与德行。", "CashBox", blocked)}
        ${homeActionButton("parents", "听父母训导", "增进亲情，也学些做人道理。", "FamilyIcon", blocked)}
        ${homeActionButton("estate", "整理家业", "成丁后清点账册与器物。", "House", blocked || state.age < 15)}
      </section>
      <div class="main-actions"><button class="ghost-btn" data-action="back-main">返回</button></div>
    </article>`;
}

function homeActionButton(action, label, note, iconName, disabled) {
  return `
    <button class="item-card home-action" data-home-action="${escapeHtml(action)}" ${disabled ? "disabled" : ""}>
      ${icon(iconName, label)}
      <strong>${escapeHtml(label)}</strong>
      <small>${escapeHtml(note)}</small>
    </button>`;
}

function placeView() {
  const place = ACTIVITY_PLACES.find((item) => item.id === view.placeId);
  if (!place) return activityPlacesView();
  const lockReason = placeLockReason(place);
  const locked = !!lockReason;
  return `
    <article class="play-card place-card">
      <p class="eyebrow">活动</p>
      <h2>${escapeHtml(place.label)}</h2>
      <p>${escapeHtml(place.note)}</p>
      ${locked ? `<p class="empty-note">${escapeHtml(lockReason)}</p>` : ""}
      <div class="button-list">
        ${(place.activities || []).map((id) => {
          const activity = getActivity(id);
          if (!activity) return "";
          return `<button class="list-btn" data-activity="${escapeHtml(activity.id)}" ${locked ? "disabled" : ""}>
            ${icon(activity.icon, activity.label)}
            <span>${escapeHtml(activity.label)}<small>${escapeHtml(activity.text)}</small></span>
          </button>`;
        }).join("")}
        ${placeActionButtons(place, locked)}
        ${place.special ? specialPlaceButton(place, locked) : ""}
        ${place.exam ? `<button class="list-btn" data-action="open-exam" ${canOpenExam() ? "" : "disabled"}>
          ${icon("OfficialSchool", "科举")}
          <span>科举考试<small>${stripTags(examStatusNote())}</small></span>
        </button>` : ""}
      </div>
      <div class="main-actions">
        <button class="ghost-btn" data-action="back-places">返回活动</button>
      </div>
    </article>
    ${place.activities?.length ? activityEventPreview(getActivity(place.activities[0])) : ""}`;
}

function placeActionButtons(place, locked) {
  const actions = {
    medicine: [
      ["medicineTreat", "问诊抓药", "花钱治病或调理体魄", "MedicineBag"],
      ["medicineStudy", "读医书", "研读医馆旧本，得学识与德行", "Book"],
    ],
    farm: [
      ["farmWork", "下田劳作", "体力换钱，略耗心情", "Agriculture"],
      ["farmTrade", "农货买卖", "牵线乡货，练处世也赚些钱", "CashBox"],
    ],
    alchemy: [["alchemyBrew", "开炉炼丹", "耗费药材，可能得丹也可能伤身", "Elixir"]],
    official: [["officialCase", "旁听断案", "观县衙审案，明人情法度", "Official"]],
    inn: [["innNews", "打听消息", "听四方近闻，可能结识新友", "Restaurant"]],
    theater: [
      ["theaterWatch", "听曲看戏", "消磨半日，心情舒展。", "Activity"],
      ["pleasureRisk", "花酒消遣", "18 岁后可入，快意花费，也有损德染病之险", "Whorehouse", 18],
      ["courtesanContest", "佳丽竞选", "18 岁后可入，赏才问答，评出一夜花魁", "FlowerChiefTitle", COURTESAN_MIN_AGE],
    ],
    temple: [["templePray", "焚香祈福", "添德行、安心绪", "Temple"]],
    academy: [["prepareExam", "备考温课", "消耗一年在书院温题，提升备考进度", "Book"]],
  }[place.id] || [];
  return actions.map(([id, label, note, iconName, minAge = 0]) => {
    const ageLocked = minAge && state.age < minAge;
    return `
    <button class="list-btn" data-place-action="${escapeHtml(id)}" ${locked || ageLocked ? "disabled" : ""}>
      ${icon(iconName, label)}
      <span>${escapeHtml(label)}<small>${escapeHtml(ageLocked ? `${minAge} 岁后开放` : note)}</small></span>
    </button>`;
  }).join("");
}

function activityPlacesView() {
  const blocked = state.dead || !!state.currentEvent || !!state.eventResult || !!state.pendingCaravan || state.prisonYears > 0;
  return `
    <article class="play-card places-card">
      <p class="eyebrow">活动</p>
      <h2>城中去处</h2>
      <p>${state.age < 6 ? "年岁尚幼，多数去处暂不可独自前往。" : "选择一个去处，再进入对应玩法页面。"}</p>
      <div class="place-grid">
        ${ACTIVITY_PLACES.map((place) => {
          const reason = blocked ? "当前有事未了" : placeLockReason(place);
          return `<button class="place-btn" data-place="${escapeHtml(place.id)}" ${reason ? "disabled" : ""}>
            ${icon(place.icon, place.label)}
            <span>${escapeHtml(place.label)}</span>
            <small>${escapeHtml(reason || place.note)}</small>
          </button>`;
        }).join("")}
      </div>
      <div class="main-actions">
        <button class="ghost-btn" data-action="back-main">返回</button>
      </div>
    </article>`;
}

function placeLockReason(place) {
  if (state.dead) return "此生已终。";
  if (state.prisonYears > 0) return "刑期未满，暂不能外出。";
  if (state.age < place.minAge) return `你年岁尚幼，${place.label}需 ${place.minAge} 岁后开放。`;
  if (place.id === "womenSchool" && state.gender !== "female") return "女学仅女子可入。";
  if (place.id === "party" && state.age < 16) return "宴会需 16 岁后方可赴。";
  return "";
}

function specialPlaceButton(place, locked) {
  if (place.special === "cricket") {
    const crickets = state.crickets.map(normalizeCricket).filter((item) => item && item.alive !== false);
    return `
      <button class="list-btn" data-cricket-action="catch" ${locked ? "disabled" : ""}>${icon("CatchCricket", "捕促织")}<span>捕促织<small>花半日到草坡瓦砾间寻虫。</small></span></button>
      ${crickets.length ? `
        <div class="cricket-roster">
          ${crickets.map((cricket) => `
            <article class="cricket-card">
              <strong>${icon(cricket.icon || "Cricket", cricket.name)}<span>${escapeHtml(cricket.name)}</span></strong>
              <small>品相 ${Math.round(cricket.quality)} · ${cricket.age}/${cricket.lifespan} 年 · 胜 ${cricket.wins || 0}</small>
              <span class="mini-actions">
                <button class="text-btn inline-action" data-cricket-action="battle" data-cricket-id="${escapeHtml(cricket.id)}" ${locked ? "disabled" : ""}>斗促织</button>
                <button class="text-btn inline-action" data-cricket-action="competition" data-cricket-id="${escapeHtml(cricket.id)}" ${locked ? "disabled" : ""}>大赛</button>
              </span>
            </article>
          `).join("")}
        </div>` : `<p class="empty-note">尚无可出战的促织，先去捕一只。</p>`}`;
  }
  if (place.special === "theater") return "";
  if (place.special === "market") {
    const factor = marketFactor();
    return `
      <p class="empty-note">今日市价：${Math.round(factor * 100)}%。各铺货色不同，价钱随年景浮动。</p>
      ${MARKET_STALLS.map((stall) => `
        <section class="shop-block">
          <h3>${icon(stall.icon, stall.label)}${escapeHtml(stall.label)}</h3>
          <div class="button-list">
            ${stall.goods.map((item, index) => {
              const price = marketPrice(item.price);
              return `<button class="list-btn" data-shop-stall="${escapeHtml(stall.id)}" data-shop-good="${index}" ${locked || state.stats.money < price ? "disabled" : ""}>${icon(item.icon, item.name)}<span>${escapeHtml(item.name)}<small>${moneyText(price)} · ${escapeHtml(item.note)}</small></span></button>`;
            }).join("")}
          </div>
        </section>
      `).join("")}
      <button class="list-btn" data-special-place="blackMarket" ${locked || state.age < 15 ? "disabled" : ""}>${icon("BlackMarket", "黑市")}<span>黑市<small>15 岁后可入，货物效力和风险都更大。</small></span></button>`;
  }
  if (place.special === "womenSchool") {
    const genderLocked = state.gender !== "female";
    return `${FEMALE_SKILLS.map((item, index) => `<button class="list-btn" data-female-skill="${index}" ${locked || genderLocked ? "disabled" : ""}>${icon(item.icon, item.name)}<span>${escapeHtml(item.name)}<small>${genderLocked ? "仅女子可学" : `${skillLevel(item.name)} 级 · ${escapeHtml(item.note)}`}</small></span></button>`).join("")}`;
  }
  if (place.special === "party") {
    const themes = DATA.database?.partyThemes || [];
    return `${themes.map((theme, index) => `<button class="list-btn" data-party="${index}" ${locked || !partyOpen(theme) ? "disabled" : ""}>${icon("DrinkingWine", theme.name)}<span>${escapeHtml(theme.name)}<small>${partyOpen(theme) ? escapeHtml(theme.keywords || "赴宴会友") : `${theme.ageRange?.x || 16}-${theme.ageRange?.y || 80} 岁开放`}</small></span></button>`).join("")}`;
  }
  const labels = {
    matchmaker: ["求媒问姻缘", "请媒人相看一门亲事。"],
    marry: ["成婚", "与相看之人成礼。"],
    gamble: ["赌大小", "双方摇骰叫点，开盅按总数判输赢。"],
    miniGames: ["入席游艺", "五子棋与投壶，胜负只争雅兴，也有小小彩头。"],
    theater: ["听曲看戏", "消磨半日，心情舒展。"],
    friend: ["约见友人", "随机结交或走动亲友。"],
  };
  const [label, note] = labels[place.special] || ["行动", "前往此处。"];
  return `<button class="list-btn" data-special-place="${escapeHtml(place.special)}" ${locked ? "disabled" : ""}>
    ${icon(place.icon, label)}
    <span>${escapeHtml(label)}<small>${escapeHtml(note)}</small></span>
  </button>`;
}

function skillLevel(name) {
  return Math.max(0, Number(state.femaleSkills?.[name]) || 0);
}

function partyOpen(theme) {
  const range = theme?.ageRange || {};
  if (state.age < Number(range.x || 16) || state.age > Number(range.y || 80)) return false;
  if (/仅限女性|年轻女性|闺房/.test(theme?.keywords || "") && state.gender !== "female") return false;
  return true;
}

function stripTags(html) {
  return String(html || "").replace(/<[^>]*>/g, "");
}

function assetsView() {
  const locked = state.age < 15;
  return `
    <article class="play-card assets-card">
      <p class="eyebrow">财产</p>
      <h2>${locked ? "禁令" : "置办家产"}</h2>
      <p>${locked ? "依律，你年岁尚幼，无法购置家产。" : "家产会在每年推进时带来些许收益，也会记入账本。"}</p>
      ${locked ? `<p class="empty-note">需满 15 岁后开放家产购置。</p>` : ""}
      <div class="asset-owned">
        ${state.assets.length ? state.assets.map(assetCard).join("") : `<p class="empty-note">尚无家产。</p>`}
      </div>
      <div class="button-list">
        ${PROPERTY_CATALOG.map((item, index) => {
          const ownedCount = assetCountByName(item.name);
          const disabled = locked || state.stats.money < item.price;
          const ownedText = ownedCount ? `已置办 ${ownedCount} 处 · ` : "";
          return `
          <button class="list-btn" data-buy-asset="${index}" ${disabled ? "disabled" : ""}>
            ${icon(item.icon, item.name)}
            <span>${escapeHtml(item.name)}<small>${escapeHtml(`${ownedText}${moneyText(item.price)} · 年入 ${moneyText(item.income)} · ${item.desc}`)}</small></span>
          </button>`;
        }).join("")}
      </div>
      <div class="main-actions"><button class="ghost-btn" data-action="back-main">返回</button></div>
    </article>`;
}

function assetCard(asset, index) {
  const condition = Math.round(Number(asset.condition ?? 72));
  const level = Math.max(1, Number(asset.level) || 1);
  const mode = asset.mode === "self" ? "自营" : "出租";
  const displayName = assetDisplayName(asset, index);
  return `
    <article class="record-item asset-card">
      <strong>${escapeHtml(displayName)} <span>${mode} · ${level}级 · 状态${condition}</span></strong>
      <p>${escapeHtml(asset.desc || "家中产业")} · 年入 ${moneyText(asset.income || 0)}</p>
      <span class="mini-actions">
        <button class="text-btn inline-action" data-asset-action="repair" data-asset-index="${index}" ${state.stats.money < Math.max(30, Math.round((asset.income || 20) * 1.6)) ? "disabled" : ""}>修缮</button>
        <button class="text-btn inline-action" data-asset-action="expand" data-asset-index="${index}" ${state.stats.money < Math.max(120, Math.round((asset.price || 200) * 0.38)) ? "disabled" : ""}>扩建</button>
        <button class="text-btn inline-action" data-asset-action="mode" data-asset-index="${index}">${asset.mode === "self" ? "改出租" : "改自营"}</button>
      </span>
    </article>`;
}

function relationsView() {
  const family = familyRows();
  const partnerGender = state.gender === "female" ? "male" : "female";
  const spouse = state.family.spouse ? [{ id: "spouse", relation: "配偶", gender: partnerGender, alive: true, affection: state.family.spouseAffection || 82, ...state.family.spouseMeta, name: state.family.spouse }] : [];
  const lover = state.family.lover ? [{ id: "lover", relation: "相看之人", gender: partnerGender, alive: true, affection: 64, ...state.family.loverMeta, name: state.family.lover }] : [];
  const children = livingChildren();
  const friends = state.friends.filter((friend) => friend.alive !== false);
  return `
    <article class="play-card relations-card">
      <p class="eyebrow">亲友</p>
      <h2>父母</h2>
      <div class="person-list">
        ${family.filter((person) => person.relation === "父亲" || person.relation === "母亲").map((person) => personCard(person, person.relation === "父亲" ? "father" : "mother")).join("")}
      </div>
      ${(family.some((person) => person.relation !== "父亲" && person.relation !== "母亲")) ? `
        <h2 class="subhead">兄弟姐妹</h2>
        <div class="person-list">${family.filter((person) => person.relation !== "父亲" && person.relation !== "母亲").map((person) => personCard(person, person.id || person.name)).join("")}</div>
      ` : `<p class="empty-note">暂未刷新到哥哥姐姐。</p>`}
      ${spouse.length || lover.length ? `<h2 class="subhead">姻缘</h2><div class="person-list">${[...spouse, ...lover].map((person) => personCard(person, person.id || person.name)).join("")}</div>` : ""}
      ${children.length ? `<h2 class="subhead">子女</h2><div class="person-list">${children.map(childCard).join("")}</div>` : state.family.spouse ? `<p class="empty-note">尚无子女。</p>` : ""}
      ${friends.length ? `<h2 class="subhead">友人</h2><div class="person-list">${friends.map((person) => personCard(person, person.id)).join("")}</div>` : ""}
      <div class="main-actions">
        <button class="secondary-btn" data-action="send-letter">发送书信</button>
        ${state.family.lover && !state.family.spouse ? `<button class="primary-btn" data-action="marry-lover" ${state.age < 16 ? "disabled" : ""}>成婚</button>` : ""}
        <button class="ghost-btn" data-action="back-main">返回</button>
      </div>
    </article>`;
}

function childCard(child) {
  const affection = clamp(Number(child.affection ?? 70));
  const physique = Math.round(Number(child.physique ?? 0));
  return `
    <article class="person-card">
      <div class="person-avatar ${child.gender === "female" ? "female" : ""}">${icon(child.gender === "female" ? "Relationship2" : "Relationship1", child.relation)}</div>
      <div>
        <strong><span>${escapeHtml(child.relation || "子女")} · ${child.age}岁</span>${escapeHtml(child.name || "无名")}</strong>
        <div class="meter"><i style="width:${affection}%"></i></div>
        <small>${escapeHtml(child.trait || "聪慧")} · 体魄 ${physique} · 学业 ${Math.round(child.study || 0)} · 德行 ${Math.round(child.virtue || 0)}</small>
        <span class="mini-actions">
          ${child.age < 15 ? `<button class="text-btn inline-action" data-teach-child="${escapeHtml(child.id)}" ${state.stats.money < CHILD_EDU_COST ? "disabled" : ""}>延师教养</button>` : `<small>已成丁，可承继家业。</small>`}
          ${relationActionButtons(child.id)}
        </span>
      </div>
    </article>`;
}

function personCard(person, targetId = "") {
  const affection = clamp(Number(person.affection ?? (person.relation === "友人" ? 48 : 78)));
  const ageText = Number.isFinite(Number(person.age)) ? ` · ${Math.round(Number(person.age))}岁` : "";
  const physiqueText = Number.isFinite(Number(person.physique)) ? ` · 体魄 ${Math.round(Number(person.physique))}` : "";
  const debtText = person.debt ? ` · 欠情 ${moneyText(person.debt)}` : "";
  const statusText = person.alive === false ? `已故${ageText}` : `${relationLabel(affection)}${ageText}${physiqueText}${debtText}`;
  return `
    <article class="person-card">
      <div class="person-avatar ${person.gender === "female" ? "female" : ""}">${icon(person.gender === "female" ? "Relationship2" : "Relationship1", person.relation)}</div>
      <div>
        <strong><span>${escapeHtml(person.relation || "亲友")}</span>${escapeHtml(person.name || "无名")}</strong>
        <div class="meter"><i style="width:${affection}%"></i></div>
        <small>${escapeHtml(statusText)}</small>
        ${person.alive === false || !targetId ? "" : `<span class="mini-actions">${relationActionButtons(targetId)}</span>`}
      </div>
    </article>`;
}

function relationActionButtons(targetId) {
  return Object.entries(RELATION_ACTIONS)
    .map(([id, item]) => `<button class="text-btn inline-action" data-relation-action="${id}" data-relation-target="${escapeHtml(targetId)}" ${item.cost && state.stats.money < item.cost ? "disabled" : ""}>${escapeHtml(item.label)}</button>`)
    .join("");
}

function relationLabel(value) {
  if (value >= 80) return "亲密";
  if (value >= 55) return "融洽";
  if (value >= 30) return "平淡";
  return "不睦";
}

function travelView() {
  const locked = state.age < 6 || state.prisonYears > 0 || !!state.pendingCaravan;
  return `
    <article class="play-card travel-card">
      <p class="eyebrow">车马</p>
      <h2>出行</h2>
      <p>${locked ? "年岁尚幼或身不由己，暂不可远行。" : "选择目的地，花费路资并改变居处。远行也会增长些许见闻。"}</p>
      <div class="button-list">
        ${TRAVEL_DESTINATIONS.map((item, index) => `
          <button class="list-btn" data-travel="${index}" ${locked || state.stats.money < item.cost ? "disabled" : ""}>
            ${icon("RepairCarriage", item.name)}
            <span>${escapeHtml(item.name)}<small>${moneyText(item.cost)} · ${escapeHtml(item.note)}</small></span>
          </button>`).join("")}
      </div>
      <div class="main-actions"><button class="ghost-btn" data-action="back-main">返回</button></div>
    </article>`;
}

function backpackView() {
  const inventoryItems = [...new Set(state.inventory)].map((name) => {
    const def = itemDefinition(name);
    const count = inventoryCount(name);
    return {
      name,
      icon: def.icon || itemIcon(name),
      note: `${def.note || "随身之物"}${count > 1 ? ` · ${count}件` : ""}`,
      category: itemCategory(name, def),
      actions: true,
    };
  });
  const extraItems = [
    ...state.crickets.map((item) => normalizeCricket(item)).filter(Boolean).map((item) => ({ name: item.name || "促织", icon: item.icon || "Cricket", note: `品相 ${Math.round(item.quality || 0)} · ${item.age}/${item.lifespan}年 · 胜 ${item.wins || 0}`, category: "curio" })),
    ...Object.entries(state.femaleSkills || {}).filter(([, level]) => Number(level) > 0).map(([name, level]) => ({ name: `女学：${name}`, icon: "FemaleSkill", note: `${level} 级`, category: "book" })),
    ...state.diseases.map((item) => ({ name: item, icon: "MedicineBag", note: "病症，可去医馆调理", category: "medicine" })),
    ...state.tags.map((item) => ({ name: item, icon: "MainBook", note: "人生记号", category: "curio" })),
  ];
  const tab = state.inventoryTab || "all";
  const items = [...inventoryItems, ...extraItems].filter((item) => tab === "all" || item.category === tab);
  const used = inventoryUsed();
  const cap = inventoryCapacity();
  return `
    <article class="play-card backpack-card">
      <p class="eyebrow">行囊</p>
      <h2>随身物件</h2>
      <p>衣食、书卷、药材与人生记号都会收在这里。</p>
      <div class="inventory-tabs">
        ${INVENTORY_CATEGORIES.map(([id, label]) => `<button class="${tab === id ? "active" : ""}" data-inventory-tab="${id}">${escapeHtml(label)}</button>`).join("")}
      </div>
      <p class="inventory-capacity">通用可存放：${used}/${cap}</p>
      <div class="item-grid">
        ${items.map((item) => `
          <article class="item-card">
            ${icon(item.icon, item.name)}
            <strong>${escapeHtml(item.name)}</strong>
            <small>${escapeHtml(item.note)}</small>
            ${item.actions ? `<span class="mini-actions item-actions">
              <button class="text-btn inline-action" data-use-item="${escapeHtml(item.name)}">使用</button>
              <button class="text-btn inline-action" data-sell-item="${escapeHtml(item.name)}">出售</button>
            </span>` : ""}
          </article>`).join("") || `<p class="empty-note">行囊空空。</p>`}
      </div>
      <div class="main-actions"><button class="ghost-btn" data-action="back-main">返回</button></div>
    </article>`;
}

function itemCategory(name, def = itemDefinition(name)) {
  const text = `${name}${def.note || ""}`;
  if (/书|卷|题|谱|帖|信|札/.test(text)) return "book";
  if (/药|丸|散|汤|酒|丹|囊|病/.test(text)) return "medicine";
  if (/佩|装备|甲|剑|刀|弓|衣|冠|履/.test(text)) return "equipment";
  if (/玉|怪|符|宝|促织|记号|天赋/.test(text)) return "curio";
  return "misc";
}

function inventoryUsed() {
  return state.inventory.length;
}

function inventoryCapacity() {
  const bags = state.inventory.filter((item) => /布包|行囊|箱/.test(item)).length;
  return INVENTORY_CAPACITY_BASE + bags * 3 + Math.max(0, Math.floor((state.assets || []).length / 2));
}

function itemIcon(item) {
  if (/书|卷|信/.test(item)) return "Book";
  if (/虎|玩|木/.test(item)) return "BambooHorse";
  if (/钱|银/.test(item)) return "CashBox";
  return "Backpack";
}

function ledgerView() {
  const rows = [...(state.ledger || []), ...state.log.filter((item) => item.deltas?.some((delta) => delta.stat === "money")).map((item) => {
    const amount = item.deltas.filter((delta) => delta.stat === "money").reduce((sum, delta) => sum + Number(delta.value || 0), 0);
    return { age: item.age, title: item.title, amount, text: item.text };
  })].slice(0, 40);
  return `
    <article class="play-card ledger-card">
      <p class="eyebrow">账本</p>
      <h2>收支</h2>
      <p>当前钱财 ${moneyText(state.stats.money)}，家产 ${state.assets.length} 件。</p>
      <div class="record-list">
        ${rows.length ? rows.map((row) => `<article class="record-item money-row ${row.amount < 0 ? "bad" : ""}">
          <strong>${row.age}岁 · ${escapeHtml(row.title)} <b>${moneyText(row.amount, { signed: true })}</b></strong>
          <p>${formatText(row.text || "")}</p>
        </article>`).join("") : `<p class="empty-note">暂无收支。</p>`}
      </div>
      <div class="main-actions"><button class="ghost-btn" data-action="back-main">返回</button></div>
    </article>`;
}

function saveManagerView() {
  const meta = loadSlotMeta();
  const slots = [];
  for (let i = 0; i < MAX_SLOTS; i++) {
    const info = meta[i];
    const isCurrent = currentSlot === i;
    const isDead = state?.dead;
    if (info) {
      const timeStr = info.timestamp ? new Date(info.timestamp).toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }) : "";
      slots.push(`<article class="save-slot ${isCurrent ? "current" : ""}">
        <div class="save-slot-header">
          <span class="save-slot-badge">存档位 ${i + 1}</span>
          ${isCurrent ? `<span class="save-slot-current">当前</span>` : ""}
        </div>
        <div class="save-slot-body">
          <strong>${escapeHtml(info.name)}</strong>
          <span class="save-slot-meta">${info.age}岁 · ${info.title} · ${timeStr}</span>
        </div>
        <div class="save-slot-actions">
          ${state && !isDead ? `<button class="text-btn" data-save-slot="${i}" data-save-action="overwrite">覆盖保存</button>` : ""}
          <button class="text-btn" data-save-slot="${i}" data-save-action="load">读取</button>
          <button class="text-btn" data-save-slot="${i}" data-save-action="export-slot">导出</button>
          <button class="text-btn danger" data-save-slot="${i}" data-save-action="delete">删除</button>
        </div>
      </article>`);
    } else {
      slots.push(`<article class="save-slot empty">
        <div class="save-slot-header">
          <span class="save-slot-badge">存档位 ${i + 1}</span>
          <span class="save-slot-empty">空</span>
        </div>
        <div class="save-slot-body">
          <span class="save-slot-hint">空存档位</span>
        </div>
        <div class="save-slot-actions">
          ${state && !isDead ? `<button class="text-btn" data-save-slot="${i}" data-save-action="save-here">保存到此处</button>` : ""}
          <button class="text-btn" data-save-slot="${i}" data-save-action="import-slot">导入存档</button>
        </div>
      </article>`);
    }
  }
  return `
    <article class="play-card save-manager-card">
      <p class="eyebrow">存档管理</p>
      <h2>多槽位存档</h2>
      <p>3 个存档位，可保存、读取、导入导出各局人生。</p>
      <div class="save-slots">
        ${slots.join("")}
      </div>
      <div class="main-actions">
        <button class="ghost-btn" data-action="back-main">返回</button>
        <button class="secondary-btn" data-action="import-file">从文件导入</button>
      </div>
      <input type="file" accept=".json" id="save-import-input" style="display:none" data-action="import-file-input">
    </article>`;
}

function menuView() {
  return `
    <article class="play-card menu-card">
      <p class="eyebrow">菜单</p>
      <h2>设置</h2>
      <p>保存、导出或重新开始当前人生。</p>
      <div class="button-list">
        <button class="list-btn" data-page="codex">${icon("MainBook", "图鉴")}<span>命格图鉴<small>查看人生阶段、目标与本局评分。</small></span></button>
        <button class="list-btn" data-action="open-save-manager">${icon("MenuButton0", "存档")}<span>存档管理<small>多槽位保存、读取与导入导出。</small></span></button>
        <button class="list-btn" data-action="export">${icon("MenuButton1", "导出")}<span>导出存档<small>下载当前人生 JSON。</small></span></button>
        <button class="list-btn danger" data-action="new-life">${icon("MenuButton2", "重开")}<span>重新开始<small>清空当前存档并开新档。</small></span></button>
      </div>
      <div class="main-actions"><button class="ghost-btn" data-action="back-main">返回</button></div>
    </article>`;
}

function codexView() {
  const score = lifeScore();
  const doneIds = new Set(completedGoals().map((goal) => goal.id));
  const triggered = new Set(state.life?.milestones || []);
  return `
    <article class="play-card codex-card">
      <p class="eyebrow">命格图鉴</p>
      <h2>${lifeGrade(score)} · ${score}</h2>
      <p>${escapeHtml(lifeInsight())}</p>
      <section class="score-grid">
        ${scoreTile("阶段", `${lifePhase().name} · ${lifePhase().focus}`)}
        ${scoreTile("目标", `${doneIds.size}/${LIFE_GOALS.length}`)}
        ${scoreTile("命册", `${state.log.length} 件事`)}
        ${scoreTile("亲友", `${familyRows().length + state.friends.length + livingChildren().length} 人`)}
      </section>
      <section class="codex-section">
        <div class="section-title"><h2>人生目标</h2></div>
        <div class="codex-grid">
          ${LIFE_GOALS.map((goal) => `
            <article class="codex-item ${doneIds.has(goal.id) ? "done" : ""}">
              ${icon(goal.icon, goal.title)}
              <strong>${escapeHtml(goal.title)}</strong>
              <small>${escapeHtml(doneIds.has(goal.id) ? goal.desc : goal.advice)}</small>
            </article>`).join("")}
        </div>
      </section>
      <section class="codex-section">
        <div class="section-title"><h2>年龄节点</h2></div>
        <div class="timeline-list">
          ${AGE_MILESTONES.map((item) => `
            <article class="timeline-item ${triggered.has(item.id) ? "done" : ""}">
              <b>${item.age}岁 · ${escapeHtml(item.title)}</b>
              <p>${escapeHtml(triggered.has(item.id) ? item.text : "尚未走到此年。")}</p>
            </article>`).join("")}
        </div>
      </section>
      <div class="main-actions"><button class="ghost-btn" data-action="back-main">返回</button></div>
    </article>`;
}

function miniGamesView() {
  const miniGames = ensureMiniGames();
  const panel = miniGames.tab === "xiangqi"
    ? xiangqiView(miniGames.xiangqi, miniGames.record)
    : miniGames.tab === "touhu"
      ? touhuView(miniGames.touhu, miniGames.record)
      : gomokuView(miniGames.gomoku, miniGames.record);
  return `
    <article class="play-card mini-game-card">
      <div class="mini-game-tabs">
        ${MINI_GAME_TABS.map(([id, label]) => `<button class="${miniGames.tab === id ? "active" : ""}" data-mini-game-tab="${id}">${label}</button>`).join("")}
      </div>
      ${panel}
      <div class="main-actions"><button class="ghost-btn" data-action="back-places">返回雅戏</button></div>
    </article>`;
}

function gomokuView(rawGame, record) {
  const game = normalizeGomokuGame(rawGame);
  return `
    <section class="mini-game-panel gomoku-panel">
      <div class="mini-game-head">
        <div>
          <p class="eyebrow">雅戏</p>
          <h2>五子棋</h2>
          <p>你执黑先行，对手执白。任意横、竖、斜五子相连即胜。</p>
        </div>
        <div class="mini-score-card">
          <span>战绩</span>
          <strong>${record.gomokuWins}胜 ${record.gomokuLosses}负 ${record.gomokuDraws}和</strong>
        </div>
      </div>
      <div class="mini-message ${game.winner ? "done" : ""}">${escapeHtml(game.message)}</div>
      <div class="gomoku-board">
        <div class="gomoku-grid" role="grid" aria-label="五子棋棋盘">
          ${game.board.map((cell, index) => gomokuCellHtml(cell, index, game)).join("")}
        </div>
      </div>
      <div class="gomoku-legend">
        <span><i class="stone black"></i>你</span>
        <span><i class="stone white"></i>对手</span>
        <span>${game.lastMove >= 0 ? `上一手：${gomokuCoord(game.lastMove)}` : "尚未落子"}</span>
      </div>
      <div class="mini-game-actions">
        <button class="primary-btn" data-action="gomoku-new">${game.winner ? "再来一局" : "重开棋局"}</button>
      </div>
    </section>`;
}

function gomokuCellHtml(cell, index, game) {
  const label = cell === 1 ? "黑子" : cell === 2 ? "白子" : "空位";
  const row = Math.floor(index / GOMOKU_SIZE);
  const col = index % GOMOKU_SIZE;
  const x = (col / (GOMOKU_SIZE - 1)) * 100;
  const y = (row / (GOMOKU_SIZE - 1)) * 100;
  return `<button class="gomoku-cell ${cell === 1 ? "black" : cell === 2 ? "white" : ""} ${game.lastMove === index ? "last" : ""}" style="--x:${x.toFixed(4)}%; --y:${y.toFixed(4)}%;" data-gomoku-cell="${index}" ${cell || game.winner ? "disabled" : ""} aria-label="${gomokuCoord(index)} ${label}">
    ${cell ? `<span class="stone ${cell === 1 ? "black" : "white"}"></span>` : ""}
  </button>`;
}

function gomokuCoord(index) {
  const row = Math.floor(index / GOMOKU_SIZE) + 1;
  const col = (index % GOMOKU_SIZE) + 1;
  return `${row}路${col}列`;
}

function xiangqiView(rawGame, record) {
  const game = normalizeXiangqiGame(rawGame);
  const selectedMoves = game.selected >= 0 ? xiangqiLegalMoves(game.board, game.selected, "r") : [];
  return `
    <section class="mini-game-panel xiangqi-panel">
      <div class="mini-game-head">
        <div>
          <p class="eyebrow">雅戏</p>
          <h2>象棋</h2>
          <p>你执红先行，对手执黑应战。当前为中档 AI，会看一层反击，适合日常娱乐与宴席社交。</p>
        </div>
        <div class="mini-score-card">
          <span>战绩 · 中档 AI</span>
          <strong>${record.xiangqiWins}胜 ${record.xiangqiLosses}负</strong>
        </div>
      </div>
      <div class="mini-message ${game.winner ? "done" : ""}">${escapeHtml(game.message)}</div>
      <div class="xiangqi-board">
        <div class="xiangqi-grid" role="grid" aria-label="象棋棋盘">
          <div class="xiangqi-river"><span>楚河</span><span>汉界</span></div>
          ${game.board.map((piece, index) => xiangqiCellHtml(piece, index, game, selectedMoves)).join("")}
        </div>
      </div>
      <div class="xiangqi-legend">
        <span><i class="xiangqi-piece red">帅</i>我方红棋</span>
        <span><i class="xiangqi-piece black">将</i>对手黑棋</span>
        <span>${game.lastMove ? `上一手：${xiangqiMoveText(game.lastMove)}` : "红方先行"}</span>
      </div>
      <div class="mini-game-actions">
        <button class="primary-btn" data-action="xiangqi-new">${game.winner ? "再来一局" : "重开棋局"}</button>
      </div>
    </section>`;
}

function xiangqiCellHtml(piece, index, game, selectedMoves) {
  const row = Math.floor(index / XIANGQI_COLS);
  const col = index % XIANGQI_COLS;
  const x = (col / (XIANGQI_COLS - 1)) * 100;
  const y = (row / (XIANGQI_ROWS - 1)) * 100;
  const side = xiangqiSide(piece);
  const legal = selectedMoves.includes(index);
  const last = game.lastMove && (game.lastMove.from === index || game.lastMove.to === index);
  const selected = game.selected === index;
  const label = piece ? `${xiangqiCoord(index)} ${side === "r" ? "红" : "黑"}${xiangqiPieceName(piece)}` : `${xiangqiCoord(index)} 空位`;
  return `<button class="xiangqi-cell ${side === "r" ? "red" : side === "b" ? "black" : ""} ${selected ? "selected" : ""} ${legal ? "legal" : ""} ${last ? "last" : ""}" style="--x:${x.toFixed(4)}%; --y:${y.toFixed(4)}%;" data-xiangqi-cell="${index}" ${game.winner ? "disabled" : ""} aria-label="${label}">
    ${piece ? `<span class="xiangqi-piece ${side === "r" ? "red" : "black"}">${xiangqiPieceName(piece)}</span>` : ""}
  </button>`;
}

function touhuView(rawGame, record) {
  const game = normalizeTouhuGame(rawGame);
  const guide = normalizeTouhuGuide(game.guide);
  const windText = game.wind === 0 ? "无风" : game.wind > 0 ? `右风 ${game.wind}` : `左风 ${Math.abs(game.wind)}`;
  const shotClass = game.lastShot ? (game.lastShot.hit ? "hit" : game.lastShot.score >= 58 ? "graze" : "miss") : "";
  const landingX = game.lastShot ? Math.max(58, Math.min(88, game.lastShot.hit ? 72 + game.lastShot.wind * 0.08 : game.lastShot.score >= 58 ? 68 + game.lastShot.wind * 0.16 : 82 + game.lastShot.wind * 0.2)) : 72;
  const landingY = game.lastShot ? Math.max(18, Math.min(72, game.lastShot.hit ? 42 : game.lastShot.score >= 58 ? 35 : 52 + Math.abs(game.lastShot.wind) * 0.35)) : 42;
  const startY = game.lastShot ? Math.max(18, Math.min(52, 13 + game.lastShot.strength * 0.34)) : 34;
  const shotStyle = game.lastShot
    ? `--shot-aim:${game.lastShot.aim}; --shot-strength:${game.lastShot.strength}; --shot-wind:${game.lastShot.wind}; --start-y:${startY.toFixed(2)}%; --land-x:${landingX.toFixed(2)}%; --land-y:${landingY.toFixed(2)}%;`
    : `--shot-aim:${game.aim}; --shot-strength:${game.strength}; --shot-wind:${game.wind}; --start-y:${startY.toFixed(2)}%; --land-x:${landingX.toFixed(2)}%; --land-y:${landingY.toFixed(2)}%;`;
  return `
    <section class="mini-game-panel touhu-panel">
      <div class="mini-game-head">
        <div>
          <p class="eyebrow">雅戏</p>
          <h2>投壶</h2>
          <p>每局五矢。角度越接近 50、力道越接近 62 越稳，风向会把箭带偏。</p>
        </div>
        <div class="mini-score-card">
          <span>最好成绩</span>
          <strong>${record.touhuBest}/${TOUHU_ARROW_COUNT} 矢</strong>
        </div>
      </div>
      <div class="touhu-stage">
        <div class="touhu-lane">
          <div class="touhu-wind ${game.wind > 0 ? "right" : game.wind < 0 ? "left" : ""}">${escapeHtml(windText)}</div>
          ${guide.visible ? touhuGuideHtml(guide) : ""}
          <div class="touhu-arrow aim-arrow" style="--aim:${game.aim}; --strength:${game.strength};"></div>
          ${game.lastShot ? `<div class="touhu-arrow flight-arrow ${shotClass}" style="${shotStyle}"></div>` : ""}
          <div class="touhu-pot"><span>壶</span></div>
        </div>
        <div class="touhu-score">
          <strong>${game.hits}</strong>
          <span>已中</span>
          <small>余 ${game.arrowsLeft} 矢</small>
        </div>
      </div>
      <div class="mini-message ${game.finished ? "done" : ""}">${escapeHtml(game.message)}</div>
      <div class="touhu-controls">
        ${touhuControl("aim", "角度", game.aim, "偏左", "偏右")}
        ${touhuControl("strength", "力道", game.strength, "轻", "重")}
      </div>
      <div class="touhu-guide-actions">
        <button class="text-btn" data-touhu-guide="toggle">${guide.visible ? "隐藏参考线" : "显示参考线"}</button>
        <button class="text-btn" data-touhu-guide="calibrate">校准到当前</button>
        <button class="text-btn" data-touhu-guide="reset">重置参考线</button>
      </div>
      <div class="touhu-history">
        ${game.throws.length ? game.throws.map((shot, index) => `<span class="${shot.hit ? "hit" : ""}">${game.throws.length - index}. ${escapeHtml(shot.quality)} ${shot.score}</span>`).join("") : `<span>尚未投矢</span>`}
      </div>
      <div class="mini-game-actions">
        <button class="primary-btn" data-action="touhu-throw" ${game.finished || game.arrowsLeft <= 0 ? "disabled" : ""}>投出一箭</button>
        <button class="ghost-btn" data-action="touhu-new">${game.finished ? "再开一局" : "重置本局"}</button>
      </div>
    </section>`;
}

function touhuGuideHtml(guide) {
  return `
    <div class="touhu-guide-line aim-guide" style="--guide-aim:${guide.aim};"><span>角度线</span></div>
    <div class="touhu-guide-line strength-guide" style="--guide-strength:${guide.strength};"><span>力道线</span></div>`;
}

function touhuControl(field, label, value, minLabel, maxLabel) {
  return `
    <label class="touhu-control">
      <span>${escapeHtml(label)} <output data-touhu-output="${field}">${value}</output></span>
      <input type="range" min="0" max="100" value="${value}" data-touhu-control="${field}" />
      <small><b>${escapeHtml(minLabel)}</b><b>${escapeHtml(maxLabel)}</b></small>
    </label>`;
}

function gambleModeTabs(active) {
  return `
    <div class="gamble-mode-tabs">
      <button class="${active === "call" ? "active" : ""}" data-gamble-mode="call">叫骰</button>
      <button class="${active === "paiGow" ? "active" : ""}" data-gamble-mode="paiGow">牌九</button>
      <button class="${active === "bigSmall" ? "active" : ""}" data-gamble-mode="bigSmall">赌大小</button>
    </div>`;
}

function paiGowPipHtml(count) {
  return `<span class="pai-gow-pips">${Array.from({ length: clamp(Math.round(Number(count) || 1), 1, 6) }, () => "<i></i>").join("")}</span>`;
}

function paiGowTileHtml(tile, options = {}) {
  const hidden = !!options.hidden;
  const interactive = !hidden && !options.locked && Number.isInteger(Number(options.index));
  const tag = interactive ? "button" : "span";
  const attrs = interactive
    ? ` type="button" draggable="true" data-pai-gow-tile="${Number(options.index)}"`
    : "";
  const classes = [
    "pai-gow-tile",
    hidden ? "hidden" : "",
    options.selected ? "selected" : "",
    options.compact ? "compact" : "",
  ].filter(Boolean).join(" ");
  const content = hidden
    ? `<b>?</b><small>未翻</small>`
    : `<strong>${escapeHtml(tile.name)}</strong>${paiGowPipHtml(tile.pips[0])}${paiGowPipHtml(tile.pips[1])}`;
  return `<${tag} class="${classes}"${attrs}>${content}</${tag}>`;
}

function paiGowHandDropHtml(game, group, locked = false) {
  const indexes = (game.hands?.[group.id] || []).slice(0, 2);
  const handTiles = indexes.map((index) => game.playerTiles[index]).filter(Boolean);
  const score = handTiles.length === 2 ? paiGowHandScore(handTiles) : null;
  return `
    <div class="pai-gow-drop ${indexes.length >= 2 ? "filled" : ""}" data-pai-gow-drop="${group.id}">
      <div class="pai-gow-drop-head">
        <strong>${escapeHtml(group.label)}</strong>
        <small>${score ? escapeHtml(score.label) : escapeHtml(group.note)}</small>
      </div>
      <div class="pai-gow-drop-tiles">
        ${indexes.length ? indexes.map((index) => paiGowTileHtml(game.playerTiles[index], { index, selected: game.selected === index, locked })).join("") : `<em>放入两张骨牌</em>`}
      </div>
    </div>`;
}

function paiGowPoolHtml(game, locked = false) {
  const assigned = paiGowAssignedIndexes(game);
  const tiles = game.playerTiles.map((tile, index) => assigned.has(index) ? "" : paiGowTileHtml(tile, { index, selected: game.selected === index, locked })).join("");
  return `
    <div class="pai-gow-pool" data-pai-gow-drop="pool">
      <div class="pai-gow-drop-head">
        <strong>我方骨牌</strong>
        <small>${locked ? "本局已开" : "拖动，或点牌后点前手/后手"}</small>
      </div>
      <div class="pai-gow-pool-tiles">${tiles || `<em>四张牌已分完</em>`}</div>
    </div>`;
}

function paiGowShowdownHtml(game) {
  if (!game.revealed || !game.result?.comparisons?.length) return "";
  return `
    <div class="pai-gow-showdown">
      <span>庄家分法：${escapeHtml(game.result.bankerSplit || "自动分牌")}</span>
      ${game.result.comparisons.map((item) => `
        <div class="pai-gow-compare ${item.result > 0 ? "win" : "lose"}">
          <strong>${escapeHtml(item.label)}${item.result > 0 ? "胜" : "负"}</strong>
          <small>我方 ${escapeHtml(item.player.label)} / 庄家 ${escapeHtml(item.banker.label)}</small>
        </div>`).join("")}
    </div>`;
}

function paiGowBankerHandsHtml(game) {
  if (!game.revealed || !game.result?.bankerHands?.length) return "";
  return `
    <div class="pai-gow-banker-hands">
      ${game.result.bankerHands.map((hand) => `
        <span>
          <b>${escapeHtml(hand.label)} ${escapeHtml(hand.score.label)}</b>
          <small>${hand.tiles.map((tile) => escapeHtml(tile.name)).join("、")}</small>
        </span>`).join("")}
    </div>`;
}

function paiGowGambleView(game) {
  const money = Math.round(state.stats.money || 0);
  const paiGow = normalizePaiGowGame(game.paiGow, game.stake);
  const stake = Math.max(GAMBLE_MIN_STAKE, Math.min(Math.round(game.stake || paiGow.stake || 50), Math.max(GAMBLE_MIN_STAKE, money)));
  const stakeOptions = GAMBLE_STAKE_OPTIONS.filter((amount) => amount <= Math.max(GAMBLE_MIN_STAKE, money));
  const canOpen = money >= GAMBLE_MIN_STAKE && !paiGow.revealed && paiGowHandsComplete(paiGow);
  const message = paiGow.result?.text || "拖动或点选骨牌，把四张牌分成前手、后手。";
  return `
    <article class="play-card gamble-card">
      ${gambleModeTabs("paiGow")}
      <section class="gamble-stage pai-gow-stage">
        <div class="gamble-opponent">
          <div class="gambler-card">
            <div class="avatar-token">九</div>
            <div>
              <span>庄家坐镇</span>
              <strong>推牌九</strong>
              <small>32 张骨牌洗后各发四张</small>
            </div>
          </div>
          <div class="pai-gow-opponent-tiles">
            ${paiGow.bankerTiles.map((tile) => paiGowTileHtml(tile, { hidden: !paiGow.revealed, compact: true, locked: true })).join("")}
          </div>
        </div>

        <div class="gamble-callout">${escapeHtml(message)}</div>

        <div class="pai-gow-table">
          <div class="pai-gow-side banker-side">
            <div class="pai-gow-side-head">
              <strong>庄家</strong>
              <small>${paiGow.revealed ? "已开牌" : "等待开牌后翻骨"}</small>
            </div>
            ${paiGowBankerHandsHtml(paiGow) || `<div class="pai-gow-cover">庄家已配好暗手</div>`}
          </div>

          <div class="pai-gow-side player-side">
            ${paiGowPoolHtml(paiGow, paiGow.revealed)}
            <div class="pai-gow-hand-grid">
              ${PAI_GOW_GROUPS.map((group) => paiGowHandDropHtml(paiGow, group, paiGow.revealed)).join("")}
            </div>
            ${paiGowShowdownHtml(paiGow)}
          </div>
        </div>

        <div class="gamble-console pai-gow-console">
          <div class="player-bet">
            <div>
              <span>我方押注</span>
              <strong>${moneyText(stake, { compact: true })}</strong>
              <small>钱财 ${moneyText(money, { compact: true })}</small>
            </div>
            <div class="stake-row">
              ${stakeOptions.map((amount) => `<button class="stake-chip ${stake === amount ? "active" : ""}" data-gamble-stake="${amount}" ${money < amount || paiGow.revealed ? "disabled" : ""}>${moneyText(amount, { compact: true })}</button>`).join("")}
            </div>
          </div>

          <div class="bid-console pai-gow-control">
            <div class="turn-strip mine">${paiGow.revealed ? `本局${paiGow.result?.outcome || "已结"}` : paiGowHandsComplete(paiGow) ? "两手已满，可以开牌" : "拖牌分手：前后各两张"}</div>
            <div class="pai-gow-auto-row">
              ${PAI_GOW_AUTO_SPLITS.map((split) => `<button class="stake-chip" data-pai-gow-auto="${split.id}" ${paiGow.revealed ? "disabled" : ""}>${split.label}</button>`).join("")}
            </div>
            <div class="gamble-actions">
              <button class="primary-btn" data-action="pai-gow-open" ${!canOpen ? "disabled" : ""}>开牌</button>
              <button class="secondary-btn" data-action="pai-gow-clear" ${paiGow.revealed ? "disabled" : ""}>收回</button>
              ${paiGow.revealed ? `<button class="ghost-btn" data-action="pai-gow-new">再来一局</button>` : ""}
            </div>
          </div>
        </div>
      </section>
      <div class="main-actions"><button class="ghost-btn" data-action="back-places">返回博坊</button></div>
    </article>`;
}

function guessDiceGambleView(game) {
  const money = Math.round(state.stats.money || 0);
  const guess = normalizeGuessDiceGame(game.guess, game.stake);
  const stake = Math.max(GAMBLE_MIN_STAKE, Math.min(Math.round(game.stake || guess.stake || 50), Math.max(GAMBLE_MIN_STAKE, money)));
  const stakeOptions = GAMBLE_STAKE_OPTIONS.filter((amount) => amount <= Math.max(GAMBLE_MIN_STAKE, money));
  const canOpen = money >= GAMBLE_MIN_STAKE && !guess.revealed;
  const message = guess.result?.text || "选好押法和赌局数，再掷骰开局。";
  const valueButtons = guess.kind === "size"
    ? ["big", "small", "same"].map((value) => `<button class="big-small-choice ${guess.choice === value ? "active" : ""}" data-guess-value="${value}" ${guess.revealed ? "disabled" : ""}><strong>${guessChoiceLabel("size", value)}</strong><span>${value === "same" ? "三枚同点，五倍赔付" : value === "big" ? "11-17 点，豹子不算大" : "4-10 点，豹子不算小"}</span></button>`).join("")
    : guess.kind === "sum"
      ? Array.from({ length: 16 }, (_, index) => index + 3).map((value) => `<button class="guess-number ${Number(guess.choice) === value ? "active" : ""}" data-guess-value="${value}" ${guess.revealed ? "disabled" : ""}>${value}</button>`).join("")
      : [1, 2, 3, 4, 5, 6].map((value) => `<button class="face-btn ${Number(guess.choice) === value ? "active" : ""}" data-guess-value="${value}" ${guess.revealed ? "disabled" : ""}>${diceFaceHtml(value)}</button>`).join("");
  return `
    <article class="play-card gamble-card">
      ${gambleModeTabs("guess")}
      <section class="gamble-stage big-small-stage">
        <div class="gamble-opponent">
          <div class="gambler-card">
            <div class="avatar-token">骰</div>
            <div>
              <span>普通博坊</span>
              <strong>猜骰</strong>
              <small>押点数、押全骰、押大小</small>
            </div>
          </div>
          <div class="hidden-dice-row">${diceRowHtml(guess.dice, !guess.revealed)}</div>
        </div>

        <div class="gamble-callout">${escapeHtml(message)}</div>

        <div class="cup-row big-small-cups">
          <div class="dice-cup opponent-cup"><span>骰盅</span></div>
          <div class="dice-cup player-cup"><span>${guess.revealed ? `${guessDiceOutcome(guess.dice).sum}点` : guessChoiceLabel(guess.kind, guess.choice)}</span></div>
        </div>

        <div class="gamble-console guess-console">
          <div class="player-bet">
            <div>
              <span>我方押注</span>
              <strong>${moneyText(stake, { compact: true })}</strong>
              <small>钱财 ${moneyText(money, { compact: true })}</small>
            </div>
            <div class="stake-row">
              ${stakeOptions.map((amount) => `<button class="stake-chip ${stake === amount ? "active" : ""}" data-gamble-stake="${amount}" ${money < amount || guess.revealed ? "disabled" : ""}>${moneyText(amount, { compact: true })}</button>`).join("")}
            </div>
          </div>

          <div class="big-small-result-panel">
            <span>${guess.revealed ? "本轮结果" : "盅内骰子"}</span>
            <div class="big-small-dice-row">${diceRowHtml(guess.dice, !guess.revealed)}</div>
            <small>${guess.revealed ? `最近一局：${guessDiceOutcome(guess.dice).sum} 点` : "开局后显示骰面"}</small>
          </div>

          <div class="guess-kind-grid">
            ${GUESS_KIND_OPTIONS.map((item) => `<button class="big-small-choice ${guess.kind === item.id ? "active" : ""}" data-guess-kind="${item.id}" ${guess.revealed ? "disabled" : ""}><strong>${item.label}</strong><span>${item.note}</span></button>`).join("")}
          </div>

          <div class="guess-value-panel ${guess.kind}">
            ${valueButtons}
          </div>

          <div class="guess-round-row">
            ${GUESS_ROUND_OPTIONS.map((count) => `<button class="stake-chip ${guess.rounds === count ? "active" : ""}" data-guess-rounds="${count}" ${guess.revealed ? "disabled" : ""}>${count} 局</button>`).join("")}
          </div>

          ${guess.history.length ? `<div class="guess-history">
            ${guess.history.map((round, index) => `<span>${index + 1}. ${round.sum}点 ${moneyText(round.amount, { signed: true, compact: true })}</span>`).join("")}
          </div>` : ""}

          <div class="gamble-actions">
            <button class="primary-btn" data-action="guess-dice-open" ${!canOpen ? "disabled" : ""}>掷骰</button>
            ${guess.revealed ? `<button class="ghost-btn" data-action="guess-dice-new">再来一轮</button>` : ""}
          </div>
        </div>
      </section>
      <div class="main-actions"><button class="ghost-btn" data-action="back-places">返回博坊</button></div>
    </article>`;
}

function bigSmallGambleView(game) {
  const money = Math.round(state.stats.money || 0);
  const bigSmall = normalizeBigSmallGame(game.bigSmall, game.stake);
  const stake = Math.max(GAMBLE_MIN_STAKE, Math.min(Math.round(game.stake || bigSmall.stake || 50), Math.max(GAMBLE_MIN_STAKE, money)));
  const stakeOptions = GAMBLE_STAKE_OPTIONS.filter((amount) => amount <= Math.max(GAMBLE_MIN_STAKE, money));
  const choice = bigSmallChoice(bigSmall.choice) || BIG_SMALL_CHOICES[0];
  const outcome = bigSmall.revealed ? bigSmallOutcome(bigSmall.dice) : null;
  const canOpen = money >= GAMBLE_MIN_STAKE && !bigSmall.revealed;
  const message = bigSmall.result?.text || "先押大、小或豹子，再开盅见分晓。";
  return `
    <article class="play-card gamble-card">
      ${gambleModeTabs("bigSmall")}
      <section class="gamble-stage big-small-stage">
        <div class="gamble-opponent">
          <div class="gambler-card">
            <div class="avatar-token">坊</div>
            <div>
              <span>庄家坐镇</span>
              <strong>博坊赌大小</strong>
              <small>三骰开盅，豹子通杀大小</small>
            </div>
          </div>
          <div class="hidden-dice-row">${diceRowHtml(bigSmall.dice, !bigSmall.revealed)}</div>
        </div>

        <div class="gamble-callout">${escapeHtml(message)}</div>

        <div class="cup-row big-small-cups">
          <div class="dice-cup opponent-cup"><span>庄家</span></div>
          <div class="dice-cup player-cup"><span>${bigSmall.revealed ? `${outcome.sum}点` : choice.label}</span></div>
        </div>

        <div class="gamble-console big-small-console">
          <div class="player-bet">
            <div>
              <span>我方押注</span>
              <strong>${moneyText(stake, { compact: true })}</strong>
              <small>钱财 ${moneyText(money, { compact: true })}</small>
            </div>
            <div class="stake-row">
              ${stakeOptions.map((amount) => `<button class="stake-chip ${stake === amount ? "active" : ""}" data-gamble-stake="${amount}" ${money < amount || bigSmall.revealed ? "disabled" : ""}>${moneyText(amount, { compact: true })}</button>`).join("")}
            </div>
          </div>

          <div class="big-small-result-panel">
            <span>${bigSmall.revealed ? "开盅结果" : "盅内骰子"}</span>
            <div class="big-small-dice-row">${diceRowHtml(bigSmall.dice, !bigSmall.revealed)}</div>
            <small>${bigSmall.revealed ? `结果：${outcome.label}，共 ${outcome.sum} 点` : "选择押注后开盅"}</small>
          </div>

          <div class="big-small-choice-grid">
            ${BIG_SMALL_CHOICES.map((item) => `
              <button class="big-small-choice ${bigSmall.choice === item.id ? "active" : ""}" data-big-small-choice="${item.id}" ${bigSmall.revealed ? "disabled" : ""}>
                <strong>${item.label}</strong>
                <span>${item.note}</span>
              </button>`).join("")}
          </div>

          <div class="gamble-actions">
            <button class="primary-btn" data-action="big-small-open" ${!canOpen ? "disabled" : ""}>开盅</button>
            ${bigSmall.revealed ? `<button class="ghost-btn" data-action="big-small-new">再来一局</button>` : ""}
          </div>
        </div>
      </section>
      <div class="main-actions"><button class="ghost-btn" data-action="back-places">返回博坊</button></div>
    </article>`;
}

function gambleView() {
  state.gamble = normalizeGamble(state.gamble);
  const game = state.gamble;
  if (game.mode === "paiGow") return paiGowGambleView(game);
  if (game.mode === "bigSmall") return bigSmallGambleView(game);
  const money = Math.round(state.stats.money || 0);
  const stake = Math.max(GAMBLE_MIN_STAKE, Math.min(Math.round(game.stake || 50), Math.max(GAMBLE_MIN_STAKE, money)));
  const stakeOptions = GAMBLE_STAKE_OPTIONS.filter((amount) => amount <= Math.max(GAMBLE_MIN_STAKE, money));
  const draft = normalizeGambleBid(game.draftBid) || nextGambleBid(game.currentBid);
  const canPlay = money >= GAMBLE_MIN_STAKE && !game.revealed;
  const playerTurn = canPlay && game.turn === "player";
  const opponentTurn = canPlay && game.turn === "opponent";
  const canOpen = playerTurn && !!game.currentBid && game.lastBidder === "opponent";
  const message = game.result?.text || (game.currentBid ? `对方已叫 ${gambleBidText(game.currentBid)}。` : "请先叫点。");
  return `
    <article class="play-card gamble-card">
      ${gambleModeTabs("call")}
      <section class="gamble-stage">
        <div class="gamble-opponent">
          <div class="gambler-card">
            <div class="avatar-token">${escapeHtml((game.opponentName || "客").slice(-1))}</div>
            <div>
              <span>对方押注</span>
              <strong>${escapeHtml(game.opponentName)}</strong>
              <small>${escapeHtml(game.opponentItem)}</small>
            </div>
          </div>
          <div class="hidden-dice-row">${diceRowHtml(game.opponentDice, !game.revealed)}</div>
        </div>

        <div class="gamble-callout">${escapeHtml(message)}</div>

        <div class="cup-row">
          <div class="dice-cup opponent-cup"><span>对方</span></div>
          <div class="dice-cup player-cup"><span>我方</span></div>
        </div>

        <div class="gamble-console">
          <div class="player-bet">
            <div>
              <span>我方押注</span>
              <strong>${moneyText(stake, { compact: true })}</strong>
              <small>钱财 ${moneyText(money, { compact: true })}</small>
            </div>
            <div class="stake-row">
              ${stakeOptions.map((amount) => `<button class="stake-chip ${stake === amount ? "active" : ""}" data-gamble-stake="${amount}" ${money < amount || game.revealed ? "disabled" : ""}>${moneyText(amount, { compact: true })}</button>`).join("")}
            </div>
          </div>

          <div class="player-dice-wrap">
            <span>我方骰子</span>
            <div class="player-dice-row">${diceRowHtml(game.playerDice, false)}</div>
          </div>

          <div class="bid-console">
            <div class="turn-strip ${game.turn === "player" ? "mine" : game.turn === "opponent" ? "theirs" : ""}">
              ${game.revealed ? "本局已开盅" : game.turn === "player" ? "轮到你：加叫或开盅" : "轮到对方：等对方应声"}
            </div>
            <div class="bid-stepper">
              <button class="round-btn" data-gamble-adjust="count:-1" ${!playerTurn ? "disabled" : ""}>-</button>
              <div class="bid-display">
                <span>叫点</span>
                <strong>${gambleBidText(draft)}</strong>
              </div>
              <button class="round-btn" data-gamble-adjust="count:1" ${!playerTurn ? "disabled" : ""}>+</button>
            </div>
            <div class="face-grid">
              ${[1, 2, 3, 4, 5, 6].map((face) => `<button class="face-btn ${draft.face === face ? "active" : ""}" data-gamble-face="${face}" ${!playerTurn ? "disabled" : ""}>${diceFaceHtml(face)}</button>`).join("")}
            </div>
            <div class="gamble-actions">
              <button class="primary-btn" data-action="gamble-confirm" ${!playerTurn || !isGambleBidLegal(draft, game.currentBid) ? "disabled" : ""}>加叫</button>
              <button class="secondary-btn" data-action="gamble-open" ${!canOpen ? "disabled" : ""}>开</button>
              ${opponentTurn ? `<button class="primary-btn opponent-action" data-action="gamble-opponent">对方行动</button>` : ""}
              ${game.revealed ? `<button class="ghost-btn" data-action="gamble-new">再来一局</button>` : ""}
            </div>
          </div>
        </div>
      </section>
      <div class="main-actions"><button class="ghost-btn" data-action="back-places">返回博坊</button></div>
    </article>`;
}

function diceRowHtml(dice, hidden = false) {
  return (dice || []).map((face) => diceFaceHtml(face, hidden)).join("");
}

function diceFaceHtml(face, hidden = false) {
  if (hidden) return `<span class="mini-die hidden">?</span>`;
  const dots = {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8],
  }[Math.max(1, Math.min(6, Number(face) || 1))];
  return `<span class="mini-die">${Array.from({ length: 9 }, (_, index) => `<i class="pip ${dots.includes(index) ? "on" : ""}"></i>`).join("")}</span>`;
}

function scoreTile(label, value) {
  return `<div class="score-tile"><span>${escapeHtml(label)}</span><b>${escapeHtml(value)}</b></div>`;
}

function endingCareerTitle() {
  if (state.career && careerKind(state.career) === "official") return officialTitle();
  if (state.official?.unlocked && state.exam?.rank >= EXAM_STAGES.length - 1) return officialTitle();
  const name = state.career?.name || "";
  if (!name) return "未定营生";
  const progress = state.careerProgress?.[name] || {};
  const level = Math.max(1, Math.round(Number(progress.level) || 1));
  return `${name} · ${level}级`;
}

function endingTagList(score = lifeScore()) {
  const tags = [
    lifeGrade(score),
    state.difficulty,
    state.location,
    state.age >= 80 ? "高寿" : "",
    state.age <= 35 ? "英年" : "",
    state.career ? careerKindLabel(careerKind(state.career)) : "",
    state.career?.name || "",
    state.exam?.rank >= 0 ? EXAM_TITLES[state.exam.rank] : "",
    hasPalaceAppointment() ? "殿试及第" : "",
    state.family?.spouse ? "成家立室" : "",
    livingChildren().length ? `${livingChildren().length}名子女` : "",
    (state.assets || []).length >= 5 ? "广置田宅" : (state.assets || []).length ? "置办家产" : "",
    state.cricketRecord?.champion ? "促织魁首" : "",
    state.miniGames?.gomoku?.wins ? "雅戏好手" : "",
    ...(state.tags || []),
    ...completedGoals().map((goal) => goal.title),
  ];
  return [...new Set(tags.map((item) => String(item || "").trim()).filter(Boolean))].slice(0, 14);
}

function endingShareData(score = lifeScore(), inheritedMoney = Math.max(20, Math.round(Math.max(0, state.stats.money || 0) * 0.78)), generation = Math.max(1, Number(state.lineage?.generation) || 1)) {
  const examTitle = state.exam?.rank >= 0 ? EXAM_TITLES[state.exam.rank] : "白身";
  const careerTitle = endingCareerTitle();
  const children = livingChildren();
  const goals = completedGoals();
  const tags = endingTagList(score);
  const grade = lifeGrade(score);
  const wealth = moneyText(state.stats?.money || 0);
  const assets = state.assets || [];
  const title = state.name || "无名氏";
  const deathReason = state.deathReason || "命数已尽";
  const highlightPool = [
    careerTitle !== "未定营生" ? `最高身份：${careerTitle}` : "",
    examTitle !== "白身" ? `功名：${examTitle}` : "",
    assets.length ? `家业：${assets.length}处产业，余财${wealth}` : `余财：${wealth}`,
    children.length ? `后嗣：${children.length}名子女可续家声` : "",
    goals.length ? `达成：${goals.slice(0, 3).map((goal) => goal.title).join("、")}` : "",
  ].filter(Boolean);
  const epitaph = endingEpitaph({ grade, score, careerTitle, examTitle, assetCount: assets.length, childCount: children.length });
  return {
    name: title,
    age: Math.round(Number(state.age) || 0),
    deathReason,
    grade,
    score,
    generation,
    location: state.location || "清平县",
    difficulty: state.difficulty || "普通",
    examTitle,
    careerTitle,
    wealth,
    inheritedMoney: moneyText(inheritedMoney),
    assetCount: assets.length,
    childCount: children.length,
    goalCount: goals.length,
    goalTotal: LIFE_GOALS.length,
    logCount: (state.log || []).length,
    tags,
    highlights: highlightPool.slice(0, 5),
    epitaph,
  };
}

function endingEpitaph(data) {
  if (data.grade === "传奇") return `${data.name || state.name}此生跌宕而成传奇，功名、家业与人情皆有可书之处，足够后人茶余饭后反复谈起。`;
  if (data.careerTitle?.includes("大学士") || data.careerTitle?.includes("尚书") || data.careerTitle?.includes("总督")) return "此生入仕登高，案牍之间也曾牵动山河，身后名望仍在乡里官场流传。";
  if (data.examTitle === "进士") return "此生读书有成，金榜题名后留下一段士林故事，虽有遗憾，终不负寒窗。";
  if (data.assetCount >= 5) return "此生勤营家业，田宅铺面渐成根基，留给后人的不只是钱财，还有一门可续的生计。";
  if (data.childCount >= 3) return "此生枝叶繁盛，家中儿女绕膝，身后仍有人接过旧名与新路。";
  if (data.score >= 480) return "此生有起有落，却终能安身立命；翻开命册，仍有几笔值得被记住。";
  return "此生平凡而真切，尝过世道冷暖，也在年月里留下了自己的痕迹。";
}

function endingSharePanel(data) {
  return `
    <section class="ending-share-panel">
      <div class="section-title">
        <h2>结局分享</h2>
        <strong>${escapeHtml(data.grade)} · ${data.score}分</strong>
      </div>
      <p>${escapeHtml(data.epitaph)}</p>
      <div class="ending-summary-grid">
        ${infoLine("角色", `${data.name} · 第${data.generation}代`)}
        ${infoLine("寿命", `${data.age}岁 · ${data.deathReason}`)}
        ${infoLine("最高身份", data.careerTitle)}
        ${infoLine("功名", data.examTitle)}
        ${infoLine("家业", `${data.assetCount}处 · ${data.wealth}`)}
        ${infoLine("传承", `${data.childCount}名子女 · 可继${data.inheritedMoney}`)}
      </div>
      <div class="ending-tag-cloud">${data.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>
      <div class="main-actions ending-share-actions">
        <button class="primary-btn" data-action="download-ending-card">下载结局卡</button>
        <button class="secondary-btn" data-action="copy-ending-text">复制分享文案</button>
      </div>
    </section>`;
}

function endingShareText() {
  const data = endingShareData();
  return [
    `【古代人生结局】${data.name}`,
    `享年：${data.age}岁（${data.deathReason}）`,
    `最高身份：${data.careerTitle}`,
    `功名：${data.examTitle}`,
    `命格：${data.grade} · ${data.score}分`,
    `家业：${data.assetCount}处 · ${data.wealth}`,
    `关键词：${data.tags.slice(0, 10).join("、")}`,
    data.epitaph,
    "https://www.dynastylife.online",
  ].join("\n");
}

function canvasRoundRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function canvasWrappedLines(ctx, text, maxWidth, maxLines = Infinity) {
  const lines = [];
  let line = "";
  let truncated = false;
  for (const char of String(text || "")) {
    if (char === "\n") {
      lines.push(line);
      line = "";
      continue;
    }
    const test = line + char;
    if (line && ctx.measureText(test).width > maxWidth) {
      lines.push(line);
      line = char;
      if (lines.length >= maxLines) {
        truncated = true;
        break;
      }
    } else {
      line = test;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  if (truncated && lines.length) {
    let last = lines[lines.length - 1];
    while (last.length > 1 && ctx.measureText(`${last}…`).width > maxWidth) last = last.slice(0, -1);
    lines[lines.length - 1] = `${last}…`;
  }
  return lines;
}

function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, maxLines = Infinity) {
  const lines = canvasWrappedLines(ctx, text, maxWidth, maxLines);
  lines.forEach((line, index) => ctx.fillText(line, x, y + index * lineHeight));
  return y + lines.length * lineHeight;
}

function drawEndingTag(ctx, tag, x, y, maxWidth) {
  const text = String(tag || "");
  const width = Math.min(maxWidth, ctx.measureText(text).width + 42);
  canvasRoundRect(ctx, x, y, width, 48, 24);
  ctx.fillStyle = "rgba(47, 125, 109, 0.14)";
  ctx.fill();
  ctx.strokeStyle = "rgba(47, 125, 109, 0.28)";
  ctx.stroke();
  ctx.fillStyle = "#2f6f62";
  ctx.fillText(text, x + 21, y + 32);
  return width;
}

function buildEndingCardCanvas() {
  const data = endingShareData();
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1440;
  const ctx = canvas.getContext("2d");
  const font = "Microsoft YaHei, SimHei, sans-serif";
  const bg = ctx.createLinearGradient(0, 0, 1080, 1440);
  bg.addColorStop(0, "#eef7ec");
  bg.addColorStop(0.48, "#fff9ec");
  bg.addColorStop(1, "#f2dfbf");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1080, 1440);

  ctx.fillStyle = "rgba(47, 125, 109, 0.08)";
  ctx.fillRect(54, 54, 972, 1332);
  ctx.strokeStyle = "#d7aa4e";
  ctx.lineWidth = 6;
  canvasRoundRect(ctx, 58, 58, 964, 1324, 34);
  ctx.stroke();

  ctx.fillStyle = "rgba(255, 255, 255, 0.68)";
  canvasRoundRect(ctx, 96, 96, 888, 1248, 28);
  ctx.fill();

  ctx.fillStyle = "#2f7d6d";
  ctx.font = `700 30px ${font}`;
  ctx.fillText("古代人生 · 结局名帖", 128, 160);
  ctx.fillStyle = "#1f2a2a";
  ctx.font = `900 78px ${font}`;
  ctx.fillText(data.name, 128, 250);
  ctx.fillStyle = "#66706c";
  ctx.font = `600 30px ${font}`;
  ctx.fillText(`第${data.generation}代 · ${data.location} · ${data.difficulty}`, 128, 304);

  const sealGradient = ctx.createLinearGradient(790, 134, 940, 284);
  sealGradient.addColorStop(0, "#f5d978");
  sealGradient.addColorStop(1, "#2f7d6d");
  ctx.fillStyle = sealGradient;
  ctx.beginPath();
  ctx.arc(860, 220, 92, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#e7c267";
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.fillStyle = "rgba(255, 252, 232, 0.9)";
  ctx.font = `900 66px ${font}`;
  ctx.textAlign = "center";
  ctx.fillText(data.name.slice(0, 1), 860, 242);
  ctx.textAlign = "left";

  const cards = [
    ["享年", `${data.age}岁`],
    ["死因", data.deathReason],
    ["命格", `${data.grade} · ${data.score}分`],
    ["功名", data.examTitle],
    ["最高身份", data.careerTitle],
    ["家业", `${data.assetCount}处 · ${data.wealth}`],
  ];
  let y = 374;
  cards.forEach(([label, value], index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = 128 + col * 416;
    const top = y + row * 126;
    ctx.fillStyle = "rgba(255, 255, 255, 0.74)";
    canvasRoundRect(ctx, x, top, 376, 92, 18);
    ctx.fill();
    ctx.strokeStyle = "rgba(47, 125, 109, 0.16)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#78807c";
    ctx.font = `700 24px ${font}`;
    ctx.fillText(label, x + 24, top + 34);
    ctx.fillStyle = "#1f2a2a";
    ctx.font = `900 30px ${font}`;
    drawWrappedText(ctx, value, x + 24, top + 70, 328, 36, 1);
  });

  y = 792;
  ctx.fillStyle = "#2f7d6d";
  ctx.font = `900 34px ${font}`;
  ctx.fillText("一生评语", 128, y);
  ctx.fillStyle = "#303938";
  ctx.font = `600 30px ${font}`;
  y = drawWrappedText(ctx, data.epitaph, 128, y + 54, 824, 48, 4) + 24;

  ctx.fillStyle = "#2f7d6d";
  ctx.font = `900 34px ${font}`;
  ctx.fillText("人生关键词", 128, y);
  ctx.font = `700 25px ${font}`;
  let tagX = 128;
  let tagY = y + 34;
  data.tags.slice(0, 12).forEach((tag) => {
    const tagWidth = Math.min(270, ctx.measureText(tag).width + 42);
    if (tagX + tagWidth > 952) {
      tagX = 128;
      tagY += 62;
    }
    const drawnWidth = drawEndingTag(ctx, tag, tagX, tagY, 270);
    tagX += drawnWidth + 14;
  });

  y = tagY + 102;
  ctx.fillStyle = "#2f7d6d";
  ctx.font = `900 34px ${font}`;
  ctx.fillText("身后简记", 128, y);
  ctx.fillStyle = "#303938";
  ctx.font = `600 27px ${font}`;
  data.highlights.slice(0, 4).forEach((line, index) => {
    ctx.fillText(`· ${line}`, 132, y + 54 + index * 42);
  });

  ctx.fillStyle = "rgba(47, 125, 109, 0.12)";
  canvasRoundRect(ctx, 128, 1256, 824, 56, 28);
  ctx.fill();
  ctx.fillStyle = "#2f7d6d";
  ctx.font = `800 25px ${font}`;
  ctx.fillText("生成于 dynastylife.online", 160, 1293);
  ctx.fillStyle = "#9b7b35";
  ctx.font = `700 22px ${font}`;
  ctx.fillText(`命册经历 ${data.logCount} 件 · 人生目标 ${data.goalCount}/${data.goalTotal}`, 612, 1293);
  return canvas;
}

function activityBucketName(bucket) {
  const names = {
    Agriculture: "农田事件",
    News: "地方消息",
    PrisonAction: "牢狱",
    SleepInWhorehouse: "风月",
    DrinkFlowerWine: "花酒",
    Administration: "政务",
    Restaurant: "酒楼",
    StudyInShangYaoJuEvent: "医馆",
    BuddhistEvent: "寺庙",
    ParentsThings: "父母",
    Alchemist: "炼丹",
    ImperialCollege: "国子监",
    FemaleSisterEvent: "闺友",
  };
  return names[bucket] || bucket;
}

function activityEventPreview(activity) {
  const events = (DATA.activityEvents || []).filter((event) => (activity.buckets || []).includes(event.bucket)).slice(0, 4);
  return `
    <section class="log-preview">
      <div class="section-title"><h2>可能遇见</h2></div>
      ${events.map((event) => infoCard(event.title || activity.label, event.history || event.content || "")).join("") || `<p class="empty-note">暂无活动事件</p>`}
    </section>`;
}

function examView() {
  const current = state.exam.current;
  if (!current) {
    const stage = EXAM_STAGES[Math.min(state.exam.rank + 1, EXAM_STAGES.length - 1)];
    return `
      <article class="play-card exam-card">
        <p class="eyebrow">科举</p>
        <h2>${escapeHtml(stage?.name || "科举")}</h2>
        <p>从 APK 题库抽题。选择题中第一个原始答案为正解，殿试按学识、处世、德行综合评卷。</p>
        <section class="prep-panel">
          <div class="section-title"><h2>备考</h2><strong>${Math.round(state.study?.prep || 0)}/100</strong></div>
          <div class="meter"><i style="width:${clamp(state.study?.prep || 0)}%"></i></div>
          <small>备考会在考试时折算为分数补益，交卷后消耗大半。</small>
        </section>
        <div class="main-actions">
          <button class="secondary-btn" data-action="prepare-exam" ${canPrepareExam() ? "" : "disabled"}>备考温课</button>
          <button class="primary-btn" data-action="start-exam" ${canOpenExam() ? "" : "disabled"}>开考</button>
          <button class="secondary-btn" data-exam-extra="poem" ${canOpenExtraExam("poem") ? "" : "disabled"}>诗词试</button>
          <button class="secondary-btn" data-exam-extra="writing" ${canOpenExtraExam("writing") ? "" : "disabled"}>经义小试</button>
          <button class="secondary-btn" data-exam-extra="female" ${canOpenExtraExam("female") ? "" : "disabled"}>女医题</button>
          <button class="secondary-btn" data-exam-extra="female-sore" ${canOpenExtraExam("female-sore") ? "" : "disabled"}>疮疡</button>
          <button class="secondary-btn" data-exam-extra="female-one" ${canOpenExtraExam("female-one") ? "" : "disabled"}>总论一</button>
          <button class="secondary-btn" data-exam-extra="female-two" ${canOpenExtraExam("female-two") ? "" : "disabled"}>总论二</button>
          <button class="ghost-btn" data-action="back-activity">返回书院</button>
        </div>
        ${examStatusNote()}
      </article>
      ${examHistory()}`;
  }
  const stage = EXAM_STAGES[current.stageIndex] || EXAM_STAGES[0];
  if (current.type === "palace") return palaceExamView(stage, current);
  return choiceExamView(stage, current);
}

function choiceExamView(stage, current) {
  const answered = (current.questions || []).filter((question) => question.selected).length;
  return `
    <article class="play-card exam-card exam-sheet">
      <p class="eyebrow">${escapeHtml(stage.name)}</p>
      <h2>考题 ${answered}/${current.questions.length}</h2>
      <div class="question-list">
        ${(current.questions || []).map((question, qIndex) => `
          <section class="question-card">
            <strong>${qIndex + 1}. ${escapeHtml(question.content)}</strong>
            <div class="answer-grid">
              ${(question.answers || []).map((answer) => `
                <button class="answer-btn ${question.selected === answer ? "active" : ""}" data-exam-answer="${escapeHtml(answer)}" data-question="${qIndex}">
                  ${escapeHtml(answer)}
                </button>`).join("")}
            </div>
          </section>`).join("")}
      </div>
      <div class="main-actions">
        <button class="primary-btn" data-action="submit-exam" ${answered < current.questions.length ? "disabled" : ""}>交卷</button>
        <button class="ghost-btn" data-action="cancel-exam">离场</button>
      </div>
    </article>`;
}

function palaceExamView(stage, current) {
  const topic = current.topic || {};
  return `
    <article class="play-card exam-card">
      <p class="eyebrow">${escapeHtml(stage.name)}</p>
      <h2>${escapeHtml(topic.topic || "策问")}</h2>
      <p>主考官命你立意成文。选题旨与文风后交卷。</p>
      <section class="exam-picks">
        <h3>题旨</h3>
        <div class="answer-grid">
          ${(topic.themes || []).map((item) => `<button class="answer-btn ${current.theme === item ? "active" : ""}" data-palace-field="theme" data-palace-value="${escapeHtml(item)}">${escapeHtml(item)}</button>`).join("")}
        </div>
      </section>
      <section class="exam-picks">
        <h3>文风</h3>
        <div class="answer-grid">
          ${(topic.writingStyles || []).map((item) => `<button class="answer-btn ${current.writingStyle === item ? "active" : ""}" data-palace-field="style" data-palace-value="${escapeHtml(item)}">${escapeHtml(item)}</button>`).join("")}
        </div>
      </section>
      <div class="main-actions">
        <button class="primary-btn" data-action="submit-exam" ${current.theme && current.writingStyle ? "" : "disabled"}>交卷</button>
        <button class="ghost-btn" data-action="cancel-exam">离场</button>
      </div>
    </article>`;
}

function examHistory() {
  return `
    <section class="log-preview">
      <div class="section-title"><h2>考绩</h2></div>
      ${(state.exam.history || []).map((item) => infoCard(item.stage, `${item.passed ? "取中" : "未中"} · ${item.score} 分${item.title ? ` · ${item.title}` : ""}`)).join("") || `<p class="empty-note">尚未应试</p>`}
    </section>`;
}

function eventView(event) {
  const options = viableChildren(event);
  return `
    <article class="play-card event-card">
      <p class="eyebrow">事件</p>
      <h2>${escapeHtml(event.title || "事件")}</h2>
      <p>${formatText(fillPlaceholders(event.content || event.history || "", false))}</p>
      <div class="choice-list">
        ${
          options.length
            ? options.map(({ child, index }) => `<button class="choice-btn" data-choice="${index}">${escapeHtml(child.title || "继续")}</button>`).join("")
            : `<button class="primary-btn" data-action="finish-event">继续</button>`
        }
      </div>
    </article>`;
}

function deathView() {
  const heirs = eligibleHeirs();
  const score = lifeScore();
  const inheritedMoney = Math.max(20, Math.round(Math.max(0, state.stats.money || 0) * 0.78));
  const generation = Math.max(1, Number(state.lineage?.generation) || 1);
  const share = endingShareData(score, inheritedMoney, generation);
  return `
    <article class="play-card death-card">
      <p class="eyebrow">身后事</p>
      <h2>${escapeHtml(state.name)}</h2>
      <p>${escapeHtml(state.name)}享年${state.age}岁，${escapeHtml(state.deathReason || "命数已尽")}。命格总评：${escapeHtml(lifeGrade(score))}，${score} 分。若有子女，可由下一代承继家业继续此存档。</p>
      <section class="score-grid">
        ${scoreTile("达成目标", `${completedGoals().length}/${LIFE_GOALS.length}`)}
        ${scoreTile("命册经历", `${state.log.length} 件`)}
        ${scoreTile("功名", state.exam.rank >= 0 ? EXAM_TITLES[state.exam.rank] : "白身")}
        ${scoreTile("家业", `${state.assets.length} 处`)}
        ${scoreTile("世代", `第${generation}代`)}
        ${scoreTile("可继钱财", moneyText(inheritedMoney))}
      </section>
      ${endingSharePanel(share)}
      <section class="inherit-section">
        <div class="section-title"><h2>选择子女承继</h2></div>
        ${heirs.length ? `<div class="button-list">${heirs.map((child) => `
          <button class="list-btn inherit-btn" data-inherit-child="${escapeHtml(child.id)}">
            ${icon(child.gender === "female" ? "Relationship2" : "Relationship1", child.name)}
            <span>${escapeHtml(child.name)}承继家业<small>${child.age}岁 · 学业 ${Math.round(child.study || 0)} · 德行 ${Math.round(child.virtue || 0)} · 继承 ${moneyText(inheritedMoney)}与 ${state.assets.length} 处家产</small></span>
          </button>`).join("")}</div>` : `<p class="empty-note">没有活着的子女可承继家业，只能另开新档。</p>`}
      </section>
      <div class="main-actions">
        <button class="${heirs.length ? "ghost-btn danger" : "primary-btn"}" data-action="new-life">另开新档</button>
        <button class="secondary-btn" data-tab="history">查看命册</button>
      </div>
    </article>`;
}

function recentLog() {
  return `
    <section class="log-preview">
      <div class="section-title"><h2>近事</h2></div>
      ${state.log.slice(0, 4).map(logItem).join("") || `<p class="empty-note">暂无记录</p>`}
    </section>`;
}

function tabBar() {
  const tabs = [
    ["overview", "概览"],
    ["activities", "活动"],
    ["career", "营生"],
    ["relations", "亲友"],
    ["inventory", "行囊"],
    ["history", "命册"],
  ];
  return `<nav class="tabs">${tabs.map(([id, label]) => `<button class="${view.tab === id ? "active" : ""}" data-tab="${id}">${label}</button>`).join("")}</nav>`;
}

function tabContent() {
  if (view.tab === "activities") return activityPanel();
  if (view.tab === "career") return careerPanel();
  if (view.tab === "relations") return relationsPanel();
  if (view.tab === "inventory") {
    const list = [
      ...state.inventory.map((item) => [item, "随身之物"]),
      ...state.crickets.map((item) => normalizeCricket(item)).filter(Boolean).map((item) => [`促织：${item.name || "无名"}`, `品相 ${Math.round(item.quality || 0)} · ${item.age}/${item.lifespan}年 · 胜 ${item.wins || 0}`]),
      ...Object.entries(state.femaleSkills || {}).filter(([, level]) => Number(level) > 0).map(([name, level]) => [`女学：${name}`, `${level} 级`]),
      ...state.diseases.map((item) => [`病症：${item}`, "可去医馆调理"]),
      ...state.tags.map((item) => [`记号：${item}`, "人生经历"]),
    ];
    return listPanel("行囊", list);
  }
  if (view.tab === "history") return historyPanel();
  return overviewPanel();
}

function historyPanel() {
  return `
    <section class="panel-content">
      <h2>命册</h2>
      <div class="life-summary">
        <strong>${escapeHtml(lifeGrade())} · ${lifeScore()} 分</strong>
        <small>${completedGoals().length}/${LIFE_GOALS.length} 个目标 · ${state.log.length} 件经历</small>
      </div>
      <div class="record-list">${state.log.map(logItem).join("") || `<p class="empty-note">暂无记录</p>`}</div>
    </section>`;
}

function overviewPanel() {
  const phase = lifePhase();
  const done = completedGoals();
  const todo = nextGoals(2);
  return `
    <section class="panel-content">
      <h2>人物</h2>
      ${infoLine("阶段", `${phase.name} · ${phase.focus}`)}
      ${infoLine("评分", `${lifeScore()} · ${lifeGrade()}`)}
      ${infoLine("命格", state.coreTalent?.name || "无")}
      ${infoLine("天赋", state.talents.map((item) => item.name).join("、") || "无")}
      ${infoLine("功名", state.exam.rank >= 0 ? EXAM_TITLES[state.exam.rank] : "白身")}
      ${infoLine("姻缘", state.family.spouse ? `已婚：${state.family.spouse}` : state.family.lover ? `相看：${state.family.lover}` : "未定")}
      ${infoLine("子女", `${livingChildren().length} 人${eligibleHeirs().length ? ` · 可承继 ${eligibleHeirs().length}` : ""}`)}
      ${infoLine("促织", `${state.crickets.length} 只 · 胜 ${state.cricketRecord.wins || 0}`)}
      ${state.career && careerKind(state.career) === "official" ? infoLine("官评", `${officialTitle()} · 政绩 ${state.official.merit || 0}`) : ""}
      ${infoLine("亲友", `${familyRows().length + state.friends.length} 人`)}
      ${infoLine("经历", `${state.log.length} 件事`)}
      <div class="goal-mini">
        <strong>已成目标 ${done.length}/${LIFE_GOALS.length}</strong>
        ${done.slice(0, 4).map((goal) => `<span>${escapeHtml(goal.title)}</span>`).join("") || `<small>尚未达成目标</small>`}
      </div>
      <div class="goal-mini todo">
        <strong>眼前可做</strong>
        ${todo.map((goal) => `<small>${escapeHtml(goal.title)}：${escapeHtml(goal.advice)}</small>`).join("") || `<small>继续经营命册即可。</small>`}
      </div>
    </section>`;
}

function activityPanel() {
  const blocked = state.dead || !!state.currentEvent || !!state.pendingCaravan || state.prisonYears > 0;
  return `
    <section class="panel-content">
      <h2>活动</h2>
      ${state.prisonYears > 0 ? `<p class="empty-note">刑期未满，暂不能外出活动。</p>` : ""}
      <div class="button-list">
        ${ACTIVITY_PLACES.map((place) => {
          const reason = blocked ? "当前有事未了" : placeLockReason(place);
          return `
          <button class="list-btn" data-place="${escapeHtml(place.id)}" ${reason ? "disabled" : ""}>
            ${icon(place.icon, place.label)}
            <span>${escapeHtml(place.label)}<small>${escapeHtml(reason || "进入地点页面")}</small></span>
          </button>`;
        }).join("")}
      </div>
    </section>`;
}

function careerPanel() {
  const careers = allCareers();
  const blocked = state.dead || !!state.pendingCaravan || state.prisonYears > 0 || state.age < 15;
  const kind = state.career ? careerKind(state.career) : "";
  const officialCareer = kind === "official";
  const progress = state.career ? (state.careerProgress[state.career.name] || { exp: 0, level: 1 }) : null;
  return `
    <section class="panel-content">
      <h2>营生</h2>
      ${state.career ? infoLine("当前", state.career.name) : `<p class="empty-note">尚无固定营生</p>`}
      ${state.career ? infoLine("本业", `${careerKindLabel(kind)} · ${Math.max(1, Number(progress.level) || 1)}级 · ${Math.round(Number(progress.exp) || 0)}经验`) : ""}
      ${officialCareer ? officialCareerSummary() : ""}
      ${kind === "caravan" ? caravanRouteSummary() : ""}
      ${state.age < 15 ? `<p class="empty-note">未满 15 岁，暂不能外出营生。</p>` : ""}
      ${state.prisonYears > 0 ? `<p class="empty-note">刑期未满，暂不能谋职。</p>` : ""}
      ${state.career ? `<div class="button-list career-actions">
        ${careerActions().map(([type, label, note]) => `
          <button class="list-btn" data-career-action="${escapeHtml(type)}" ${blocked ? "disabled" : ""}>
            ${icon(careerIcon(kind), label)}
            <span>${escapeHtml(label)}<small>${escapeHtml(note)}</small></span>
          </button>`).join("")}
      </div>` : ""}
      <div class="career-list">
        ${careers.map((career, index) => {
          const lockReason = careerLockedReason(career);
          return `
          <button class="career-card" data-career="${index}" ${blocked || lockReason ? "disabled" : ""}>
            <strong>${escapeHtml(career.name || "营生")}</strong>
            <span>${escapeHtml(careerDisplayText(career, lockReason))}</span>
          </button>`;
        }).join("")}
      </div>
    </section>`;
}

function relationsPanel() {
  const rows = [
    ...familyRows().map((person) => [person.name, relationSummary(person)]),
    ...(state.family.spouse ? [[state.family.spouse, relationSummary({ relation: "配偶", affection: state.family.spouseAffection || 78, ...state.family.spouseMeta, name: state.family.spouse })]] : []),
    ...(state.family.lover ? [[state.family.lover, relationSummary({ relation: "相看之人", affection: 64, ...state.family.loverMeta, name: state.family.lover })]] : []),
    ...livingChildren().map((child) => [child.name, `${child.relation} · ${child.age}岁 · 体魄 ${Math.round(child.physique || 0)} · 学业 ${Math.round(child.study || 0)}`]),
    ...state.friends.filter((friend) => friend.alive !== false).map((friend) => [friend.name, relationSummary(friend)]),
  ];
  return listPanel("亲友", rows);
}

function familyRows() {
  return [state.family.father, state.family.mother, ...(state.family.siblings || [])].filter(Boolean);
}

function relationSummary(person) {
  const affectionText = person.affection !== undefined && person.alive !== false ? ` · ${relationLabel(person.affection)}` : "";
  const ageText = Number.isFinite(Number(person.age)) ? ` · ${Math.round(Number(person.age))}岁` : "";
  const physiqueText = Number.isFinite(Number(person.physique)) ? ` · 体魄 ${Math.round(Number(person.physique))}` : "";
  const debtText = person.debt ? ` · 欠情 ${moneyText(person.debt)}` : "";
  return `${person.relation || "亲友"}${person.alive === false ? " · 已故" : affectionText}${ageText}${physiqueText}${debtText}`;
}

function listPanel(title, rows) {
  return `
    <section class="panel-content">
      <h2>${escapeHtml(title)}</h2>
      <div class="record-list">${rows.length ? rows.map(([a, b]) => infoCard(a, b)).join("") : `<p class="empty-note">暂无</p>`}</div>
    </section>`;
}

function infoLine(label, value) {
  return `<div class="info-line"><span>${escapeHtml(label)}</span><b>${escapeHtml(value)}</b></div>`;
}

function infoCard(title, text) {
  return `<article class="record-item"><strong>${escapeHtml(title)}</strong><p>${formatText(text)}</p></article>`;
}

function logItem(item) {
  return `<article class="record-item"><strong>${item.age}岁 · ${escapeHtml(item.title)}</strong><p>${formatText(item.text || "")}</p></article>`;
}

function exportSave() {
  if (!state) return;
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${state.name || "dynasty-life"}-save.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadEndingCard() {
  if (!state?.dead) return;
  const canvas = buildEndingCardCanvas();
  const a = document.createElement("a");
  a.href = canvas.toDataURL("image/png");
  a.download = `${state.name || "古代人生"}-结局卡.png`;
  a.click();
}

async function copyEndingText(button) {
  if (!state?.dead) return;
  const text = endingShareText();
  let copied = false;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      copied = true;
    }
  } catch {
    copied = false;
  }
  if (!copied) {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.left = "-9999px";
    document.body.appendChild(area);
    area.select();
    try {
      copied = document.execCommand("copy");
    } catch {
      copied = false;
    }
    area.remove();
  }
  if (button) {
    const oldText = button.textContent;
    button.textContent = copied ? "已复制" : "复制失败";
    setTimeout(() => { button.textContent = oldText; }, 1200);
  }
}

function chooseProfileAvatar(path) {
  if (!state || !avatarOptions(state.gender).includes(path)) return;
  state.profileAvatar = path;
  save();
  render();
}

function finishOnboarding({ advance = false } = {}) {
  if (!state) return;
  state.onboarding = { version: ONBOARDING_VERSION, seen: true };
  view.overlay = "";
  save();
  if (advance) return nextYear();
  render();
}

app.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  if (button.dataset.action === "continue-save") {
    if (!state) {
      const meta = loadSlotMeta();
      const index = meta
        .map((info, slot) => (info ? { ...info, slot } : null))
        .filter(Boolean)
        .sort((a, b) => Number(b.timestamp || 0) - Number(a.timestamp || 0))[0]?.slot;
      if (Number.isFinite(index)) {
        state = loadSave(index);
        currentSlot = index;
        if (state) state.saveSlot = index;
      }
    }
    view.screen = "game";
    view.page = "save-manager";
    render();
    return;
  }
  if (button.dataset.action === "start-life") return startLife();
  if (button.dataset.action === "reroll") return rerollDraft();
  if (button.dataset.action === "random-name") return randomName();
  if (button.dataset.profileAvatar) return chooseProfileAvatar(button.dataset.profileAvatar);
  if (button.dataset.action === "open-onboarding") {
    view.overlay = "onboarding";
    render();
    return;
  }
  if (button.dataset.action === "finish-onboarding") return finishOnboarding();
  if (button.dataset.action === "onboarding-next-year") return finishOnboarding({ advance: true });
  if (button.dataset.action === "next-year") return nextYear();
  if (button.dataset.action === "finish-event") return finishEvent();
  if (button.dataset.action === "finish-result") return finishEventResult();
  if (button.dataset.action === "close-overlay") {
    view.overlay = "";
    save();
    render();
    return;
  }
  if (button.dataset.action === "close-surprise") {
    view.overlay = "";
    state.pendingSurprise = null;
    save();
    render();
    return;
  }
  if (button.dataset.action === "open-save-manager") {
    view.page = "save-manager";
    render();
    return;
  }
  if (button.dataset.action === "import-file") {
    const input = document.getElementById("save-import-input");
    if (input) {
      input.dataset.importTargetSlot = "";
      input.click();
    }
    return;
  }
  if (button.dataset.saveSlot !== undefined && button.dataset.saveAction) {
    const slot = Number(button.dataset.saveSlot);
    const action = button.dataset.saveAction;
    if (action === "overwrite" || action === "save-here") {
      currentSlot = slot;
      if (state) state.saveSlot = slot;
      save();
      render();
      return;
    }
    if (action === "load") {
      const loaded = loadSave(slot);
      if (loaded) {
        state = loaded;
        currentSlot = slot;
        state.saveSlot = slot;
        view.screen = "game";
        view.page = "main";
        view.overlay = state.onboarding?.seen ? "" : "onboarding";
        render();
      }
      return;
    }
    if (action === "export-slot") {
      const slotState = loadSave(slot);
      if (slotState) {
        const blob = new Blob([JSON.stringify(slotState, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${slotState.name || "dynasty-life"}-存档位${slot + 1}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
      return;
    }
    if (action === "delete") {
      localStorage.removeItem(slotKey(slot));
      clearSlotMeta(slot);
      if (currentSlot === slot) currentSlot = -1;
      render();
      return;
    }
    if (action === "import-slot") {
      const input = document.getElementById("save-import-input");
      if (input) { input.dataset.importTargetSlot = String(slot); input.click(); }
      return;
    }
  }
  if (button.dataset.action === "toggle-sfx") {
    SFX.toggleMute();
    render();
    return;
  }
  if (button.dataset.action === "new-life") {
    clearSave();
    state = null;
    draft = newDraft(draft?.gender);
    view = { screen: "create", page: "main", tab: "overview", activityId: "", placeId: "", overlay: "" };
    render();
    return;
  }
  if (button.dataset.action === "export") return exportSave();
  if (button.dataset.action === "download-ending-card") return downloadEndingCard();
  if (button.dataset.action === "copy-ending-text") return copyEndingText(button);
  if (button.dataset.action === "back-main") {
    view.page = "main";
    view.placeId = "";
    render();
    return;
  }
  if (button.dataset.action === "back-places") {
    view.page = "place";
    view.placeId = "";
    render();
    return;
  }
  if (button.dataset.action === "back-activity") {
    view.page = "activity";
    view.activityId = "academy";
    render();
    return;
  }
  if (button.dataset.action === "start-activity") return startActivity(button.dataset.activityId);
  if (button.dataset.action === "open-exam") {
    view.page = "exam";
    render();
    return;
  }
  if (button.dataset.action === "start-exam") return startExam();
  if (button.dataset.action === "prepare-exam") return prepareExam();
  if (button.dataset.action === "submit-exam") return submitExam();
  if (button.dataset.action === "cancel-exam") {
    state.exam.current = null;
    view.page = "activity";
    view.activityId = "academy";
    save();
    render();
    return;
  }
  if (button.dataset.gender) {
    draft.gender = button.dataset.gender;
    randomName();
    return;
  }
  if (button.dataset.tab) {
    view.tab = button.dataset.tab;
    render();
    return;
  }
  if (button.dataset.overlay) {
    view.overlay = button.dataset.overlay;
    render();
    return;
  }
  if (button.dataset.inventoryTab) {
    state.inventoryTab = button.dataset.inventoryTab;
    save();
    render();
    return;
  }
  if (button.dataset.shortcut) {
    view.page = button.dataset.shortcut;
    view.placeId = "";
    render();
    return;
  }
  if (button.dataset.door) {
    if (button.dataset.door === "relations") view.tab = "relations";
    view.page = button.dataset.door === "activities" ? "place" : button.dataset.door;
    view.placeId = "";
    render();
    return;
  }
  if (button.dataset.page) {
    view.page = button.dataset.page;
    view.placeId = button.dataset.place === "activities" ? "" : button.dataset.place || "";
    render();
    return;
  }
  if (button.dataset.place) {
    view.page = "place";
    view.placeId = button.dataset.place;
    render();
    return;
  }
  if (button.dataset.choice !== undefined) return chooseOption(Number(button.dataset.choice));
  if (button.dataset.homeAction) return performHomeAction(button.dataset.homeAction);
  if (button.dataset.activity) return openActivity(button.dataset.activity);
  if (button.dataset.gambleAdjust) {
    const [field, delta] = button.dataset.gambleAdjust.split(":");
    return setGambleDraft(field, Number(delta));
  }
  if (button.dataset.gambleMode) return setGambleMode(button.dataset.gambleMode);
  if (button.dataset.gambleFace) return chooseGambleFace(button.dataset.gambleFace);
  if (button.dataset.gambleStake) return setGambleStake(button.dataset.gambleStake);
  if (button.dataset.miniGameTab) return setMiniGameTab(button.dataset.miniGameTab);
  if (button.dataset.gomokuCell !== undefined) return playGomokuCell(button.dataset.gomokuCell);
  if (button.dataset.xiangqiCell !== undefined) return handleXiangqiCell(button.dataset.xiangqiCell);
  if (button.dataset.touhuGuide) return adjustTouhuGuide(button.dataset.touhuGuide);
  if (button.dataset.guessKind) return chooseGuessKind(button.dataset.guessKind);
  if (button.dataset.guessValue) return chooseGuessValue(button.dataset.guessValue);
  if (button.dataset.guessRounds) return setGuessRounds(button.dataset.guessRounds);
  if (button.dataset.courtesanAction) return chooseCourtesanAction(button.dataset.courtesanId, button.dataset.courtesanAction);
  if (button.dataset.paiGowTile !== undefined) return selectPaiGowTile(button.dataset.paiGowTile);
  if (button.dataset.paiGowAuto) return autoPaiGowSplit(button.dataset.paiGowAuto);
  if (button.dataset.bigSmallChoice) return chooseBigSmall(button.dataset.bigSmallChoice);
  if (button.dataset.caravanChoice) return chooseCaravanOption(button.dataset.caravanChoice);
  if (button.dataset.action === "gomoku-new") return resetGomokuGame();
  if (button.dataset.action === "xiangqi-new") return resetXiangqiGame();
  if (button.dataset.action === "touhu-throw") return throwTouhuArrow();
  if (button.dataset.action === "touhu-new") return resetTouhuGame();
  if (button.dataset.action === "gamble-confirm") return confirmGambleBid();
  if (button.dataset.action === "gamble-open") return revealGamble("player");
  if (button.dataset.action === "gamble-opponent") return opponentGambleTurn();
  if (button.dataset.action === "gamble-new") return newGambleRound();
  if (button.dataset.action === "guess-dice-open") return revealGuessDice();
  if (button.dataset.action === "guess-dice-new") return newGuessDiceRound();
  if (button.dataset.action === "pai-gow-open") return revealPaiGow();
  if (button.dataset.action === "pai-gow-clear") return clearPaiGowHands();
  if (button.dataset.action === "pai-gow-new") return newPaiGowRound();
  if (button.dataset.action === "big-small-open") return revealBigSmall();
  if (button.dataset.action === "big-small-new") return newBigSmallRound();
  if (button.dataset.action === "courtesan-contest-start") return startCourtesanContest(true);
  if (button.dataset.action === "courtesan-contest-finish") return finishCourtesanContest();
  if (button.dataset.specialPlace) return useSpecialPlace(button.dataset.specialPlace);
  if (button.dataset.placeAction) return performPlaceAction(button.dataset.placeAction);
  if (button.dataset.cricketAction) return cricketAction(button.dataset.cricketAction, button.dataset.cricketId || "");
  if (button.dataset.shopStall) return buyShopGood(button.dataset.shopStall, button.dataset.shopGood);
  if (button.dataset.buyGood !== undefined) return buyGood(button.dataset.buyGood);
  if (button.dataset.party !== undefined) return attendParty(button.dataset.party);
  if (button.dataset.femaleSkill !== undefined) return studyFemaleSkill(button.dataset.femaleSkill);
  if (button.dataset.useItem) return useInventoryItem(button.dataset.useItem);
  if (button.dataset.sellItem) return sellInventoryItem(button.dataset.sellItem);
  if (button.dataset.teachChild) return teachChild(button.dataset.teachChild);
  if (button.dataset.inheritChild) return inheritFromChild(button.dataset.inheritChild);
  if (button.dataset.relationAction) return interactRelation(button.dataset.relationTarget, button.dataset.relationAction);
  if (button.dataset.action === "send-letter") return sendLetter();
  if (button.dataset.action === "marry-lover") return marryLover();
  if (button.dataset.action === "official-work") return handleOfficialWork();
  if (button.dataset.assetAction) return manageAsset(button.dataset.assetIndex, button.dataset.assetAction);
  if (button.dataset.buyAsset !== undefined) return buyAsset(button.dataset.buyAsset);
  if (button.dataset.travel !== undefined) return travelTo(button.dataset.travel);
  if (button.dataset.career !== undefined) return takeCareer(button.dataset.career);
  if (button.dataset.careerAction) return performCareerAction(button.dataset.careerAction);
  if (button.dataset.examExtra) return startExtraExam(button.dataset.examExtra);
  if (button.dataset.examAnswer !== undefined) return answerExam(button.dataset.question, button.dataset.examAnswer);
  if (button.dataset.palaceField) return choosePalace(button.dataset.palaceField, button.dataset.palaceValue);
});

app.addEventListener("input", (event) => {
  const target = event.target;
  if (target.dataset.field === "name") {
    const value = target.value.trim() || "李青云";
    draft.family = value.slice(0, 1);
    draft.given = value.slice(1) || "青云";
  }
  if (target.dataset.field === "difficulty") draft.difficulty = target.value;
  if (target.dataset.touhuControl) setTouhuControl(target.dataset.touhuControl, target.value);
});

document.addEventListener("change", (event) => {
  const input = event.target;
  if (input.id !== "save-import-input" || !input.files?.length) return;
  const file = input.files[0];
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);
      if (!imported.name || !imported.stats) { alert("无效的存档文件"); return; }
      const importedState = normalizeState(imported);
      const targetSlot = input.dataset.importTargetSlot !== "" ? Number(input.dataset.importTargetSlot) : -1;
      if (targetSlot >= 0 && targetSlot < MAX_SLOTS) {
        importedState.saveSlot = targetSlot;
        localStorage.setItem(slotKey(targetSlot), JSON.stringify(importedState));
        updateSlotMeta(targetSlot, importedState);
        if (view.page === "save-manager") render();
        else { state = importedState; currentSlot = targetSlot; view.screen = "game"; view.page = "main"; render(); }
      } else {
        const meta = loadSlotMeta();
        const slot = firstEmptySlot(meta);
        importedState.saveSlot = slot;
        localStorage.setItem(slotKey(slot), JSON.stringify(importedState));
        updateSlotMeta(slot, importedState);
        if (view.page === "save-manager") render();
      }
    } catch { alert("导入失败：存档文件格式有误"); }
  };
  reader.readAsText(file);
  input.value = "";
  input.dataset.importTargetSlot = "";
});

app.addEventListener("click", (event) => {
  if (event.target.closest("button")) return;
  const drop = event.target.closest("[data-pai-gow-drop]");
  if (!drop) return;
  placePaiGowSelected(drop.dataset.paiGowDrop);
});

app.addEventListener("dragstart", (event) => {
  const tile = event.target.closest("[data-pai-gow-tile]");
  if (!tile || !event.dataTransfer) return;
  event.dataTransfer.setData("text/plain", tile.dataset.paiGowTile);
  event.dataTransfer.effectAllowed = "move";
});

app.addEventListener("dragover", (event) => {
  if (event.target.closest("[data-pai-gow-drop]")) event.preventDefault();
});

app.addEventListener("drop", (event) => {
  const drop = event.target.closest("[data-pai-gow-drop]");
  if (!drop || !event.dataTransfer) return;
  event.preventDefault();
  const index = event.dataTransfer.getData("text/plain");
  if (index === "") return;
  movePaiGowTile(index, drop.dataset.paiGowDrop);
});
