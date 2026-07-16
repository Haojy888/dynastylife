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
  FamilyFatherAvatar: "assets/premium-icons/family-father-avatar.webp",
  FamilyMotherAvatar: "assets/premium-icons/family-mother-avatar.webp",
  FamilyWifeAvatar: "assets/courtesan-avatar-1.webp",
  FamilyConcubineAvatar: "assets/courtesan-avatar-2.webp",
  FamilyBetrothedAvatar: "assets/courtesan-avatar-3.webp",
  FamilyHusbandAvatar: "assets/player-avatar-male-1.webp",
  FamilyBrotherAvatar: "assets/premium-icons/family-brother-avatar.webp",
  FamilySisterAvatar: "assets/premium-icons/family-sister-avatar.webp",
  FamilySonAvatar: "assets/premium-icons/family-son-avatar.webp",
  FamilyDaughterAvatar: "assets/premium-icons/family-daughter-avatar.webp",
  FamilyFriendAvatar: "assets/premium-icons/family-friend-avatar.webp",
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
const OFFICIAL_TENDENCY = {
  clean: { label: "清名", note: "百姓爱戴，升迁稍慢但身后评价更高" },
  neutral: { label: "中正", note: "左右持平，考课风险较低" },
  corrupt: { label: "浊名", note: "钱财与人脉来得快，也更易招弹劾" },
};
const OFFICIAL_NETWORK_SEEDS = [
  { name: "张廷玉", relation: "座主", faction: "帝党", affection: 74, rank: 15 },
  { name: "李卫", relation: "同年", faction: "实干派", affection: 66, rank: 9 },
  { name: "陈梦雷", relation: "同乡", faction: "清流", affection: 58, rank: 7 },
  { name: "沈其远", relation: "上司", faction: "中立", affection: 52, rank: 11 },
  { name: "年羹尧", relation: "政敌", faction: "军功派", affection: -28, rank: 16 },
  { name: "高士奇", relation: "幕友", faction: "词臣", affection: 48, rank: 8 },
];
const OFFICIAL_AFFAIRS = [
  {
    id: "archives",
    label: "案牍",
    minRank: 0,
    icon: "Official",
    primary: "eq",
    secondary: "knowledge",
    clean: 1,
    merit: [8, 18],
    note: "核对文书、排定考语，低阶官吏最常经手。",
    stories: [
      "吏房堆着历年黄册，你翻到一处里甲脱漏，顺藤摸瓜补齐了三村户籍。",
      "上司催要考成册，你连夜分门别类，把积压案牍整理得可查可验。",
      "有书吏偷换批语，你比对朱墨笔迹，留下暗记，待堂上再行揭破。",
      "驿传文移迟误，几处公文互相推诿，你逐件追问，总算把责任厘清。",
    ],
  },
  {
    id: "tax",
    label: "钱粮",
    minRank: 2,
    icon: "CashBox",
    primary: "knowledge",
    secondary: "virtue",
    clean: 2,
    merit: [10, 24],
    note: "核算赋税、仓储与亏空，最考验清浊取舍。",
    stories: [
      "仓廪盘点时少了三百石陈粮，你先封存簿册，再召库丁对账，查出前任留下的亏空。",
      "秋粮解运将启，豪户暗示愿代垫脚费，你没有立刻点头，先把乡约与保甲都叫来复核。",
      "灾后田亩减产，税额仍按旧册催征，你据实改造册籍，替百姓缓了一口气。",
      "银库交割时成色不齐，你请匠人验银，又命书吏当场重记，堵住了一条暗门。",
    ],
  },
  {
    id: "law",
    label: "刑名",
    minRank: 1,
    icon: "PrisonHeader",
    primary: "eq",
    secondary: "virtue",
    clean: 2,
    merit: [12, 28],
    note: "审案、缉捕、复核供词，严宽之间见官声。",
    stories: [
      "两姓争坟闹到堂前，你没有急着动刑，先验旧契与族谱，竟查出一桩二十年前的误记。",
      "盗马案证词彼此抵牾，你让差役重走夜路，按脚印宽窄寻回真凶。",
      "狱中囚犯喊冤，你顶着同僚埋怨复核供词，最终替其洗去重罪。",
      "捕役押来惯偷，乡绅求你严办，你仍按律分辨轻重，免得一时痛快坏了法度。",
    ],
  },
  {
    id: "education",
    label: "教化",
    minRank: 4,
    icon: "OfficialSchool",
    primary: "knowledge",
    secondary: "eq",
    clean: 1,
    merit: [10, 22],
    note: "主持学政、修县志、整饬士风，能养长远名望。",
    stories: [
      "县学久缺祭器，你带生员整理旧藏，又亲自讲一场乡约，学风渐有起色。",
      "岁试前有人递来关节条子，你当众封存，另出新题，士子虽惊，反多敬服。",
      "修县志时豪族争抢列传名次，你按实事轻重编排，宁可得罪人也不乱史笔。",
      "乡里争学田租佃，你请老儒、里正同议，定下轮佃章程。",
    ],
  },
  {
    id: "river",
    label: "河工",
    minRank: 7,
    icon: "RepairCarriage",
    primary: "physique",
    secondary: "knowledge",
    clean: 1,
    risk: 0.24,
    merit: [14, 34],
    note: "修堤防洪、调徭役，有功大，也可能伤身破财。",
    stories: [
      "春汛将至，旧堤渗水，你穿蓑衣巡到三更，终于找到蚁穴与暗涌。",
      "河夫怨工食被克扣，你没有只催工期，而是先查饭账，免得民怨压垮堤防。",
      "上游忽报山洪，你连夜调木石堵口，脚下泥水没膝，文书也被雨打花了。",
      "盐商愿捐银修桥，却要在桥头立私坊，你斟酌利害，另议公碑记名。",
    ],
  },
  {
    id: "military",
    label: "兵备",
    minRank: 8,
    icon: "RepairCarriage",
    primary: "physique",
    secondary: "eq",
    clean: 0,
    risk: 0.18,
    merit: [14, 32],
    note: "操练乡勇、查军饷、处置边报，风险与声望并行。",
    stories: [
      "乡勇名册虚浮，你亲自点验弓矢甲械，裁掉空名，补足巡防。",
      "边报传来盗匪流窜，你没有轻率出兵，先派老练捕役探清虚实。",
      "军饷发放前有人夹带短秤，你令营伍列队复称，哗然之后反得军心。",
      "驿路被劫，商旅不敢通行，你调民壮设卡，三日后擒住贼首。",
    ],
  },
  {
    id: "diplomacy",
    label: "外交",
    minRank: 11,
    icon: "Relationship1",
    primary: "eq",
    secondary: "knowledge",
    clean: 0,
    merit: [16, 36],
    note: "接待使节、处置边贸与争端，高阶官员方能经手。",
    stories: [
      "番邦使节带来贡物名册，却在礼节上故意试探，你以典故应答，既不失礼也不让步。",
      "边民互市起争斗，你把两边译人分开询问，才知是度量衡不同引起误会。",
      "邻省商帮争码头，你设席调停，暗中查清背后靠山，留足回旋余地。",
      "朝廷新开边市，盐茶价格牵动各方，你连拟三道条陈，终于让上司点头。",
    ],
  },
  {
    id: "ministry",
    label: "部务",
    minRank: 17,
    icon: "Official",
    primary: "knowledge",
    secondary: "eq",
    clean: 1,
    merit: [20, 44],
    note: "入掌六部，议天下大政，成败都会写入国史。",
    stories: [
      "部中议天下漕粮改折，你翻检十年奏销，指出三处必乱之弊。",
      "朝会上两派争论军饷，你没有急着附和座主，而是把边镇实数列在笏板后。",
      "新律拟定，刑部与户部互不相让，你以民生为据，替条文留出宽严尺度。",
      "皇帝问及荒政，你引旧例又补新法，殿中一时寂然。",
    ],
  },
];
const OFFICIAL_CASES = [
  {
    id: "silver-shortage",
    title: "库银亏空",
    minRank: 2,
    prompt: "上司来查库银，发现少了三百两。你心知此事多半是前任遗留的窟窿，此刻如何处置？",
    options: [
      { id: "report", label: "如实上报", note: "清名增加，考课未必好看", merit: [12, 24], virtue: [3, 7], clean: 4, relation: [-2, 2], text: "你据实写明来龙去脉，又附上补救章程。上司面色不佳，却也挑不出你欺瞒之处。" },
      { id: "cover", label: "设法填补", note: "花钱消灾，关系较稳", merit: [8, 18], money: [-180, -80], eq: [2, 5], clean: -1, relation: [2, 6], text: "你先垫银补齐账面，再慢慢追索旧欠。事情暂时压下，胥吏也知你会做人。" },
      { id: "shift", label: "推给前任", note: "或可脱身，但德行受损", merit: [4, 14], virtue: [-5, -2], eq: [-3, 1], clean: -3, corruption: 2, text: "你把责任全推给前任旧班，上司暂且采信，可衙中旧人看你的眼神已有不同。" },
      { id: "hide", label: "隐瞒不报", note: "来钱快，后患极大", merit: [-6, 8], money: [120, 320], virtue: [-8, -3], clean: -6, corruption: 6, impeachment: 0.28, text: "你改动账页暂掩亏空，还从中抽出一笔浮财。只是这道裂缝迟早会再透风。" },
    ],
  },
  {
    id: "bribe-gentry",
    title: "豪绅递礼",
    minRank: 3,
    prompt: "本县大户为争水渠先后，夜里遣管家送来厚礼，言辞温软，只求你在批文上挪一挪次序。",
    options: [
      { id: "reject", label: "当面退回", note: "百姓称快，豪族记恨", merit: [10, 22], virtue: [3, 6], clean: 5, relation: [-5, -1], text: "你命管家把礼原封带回，又在堂上公开水渠章程，乡民暗中称快。" },
      { id: "mediate", label: "召众公议", note: "稳妥中正", merit: [12, 24], eq: [2, 5], clean: 1, relation: [1, 4], text: "你召两村父老、豪绅与渠甲同议，按田亩远近排定时序，各方虽不尽满意，却都能接受。" },
      { id: "accept", label: "收礼批文", note: "发财但浊名上涨", merit: [6, 16], money: [160, 420], virtue: [-7, -3], clean: -5, corruption: 5, impeachment: 0.2, text: "你收下厚礼，批文自然偏了几分。豪绅眉开眼笑，水尾小民却在背后骂了半月。" },
    ],
  },
  {
    id: "impeachment",
    title: "政敌弹劾",
    minRank: 5,
    prompt: "御史台递来弹章，说你治下钱粮不清、任用私人。你知道背后多半有政敌推波助澜。",
    options: [
      { id: "defend", label: "具折自辩", note: "看学识与政绩", merit: [8, 20], knowledge: [1, 4], clean: 1, relation: [-3, 1], text: "你逐条列证，自辩不卑不亢。弹章虽未立刻撤下，朝中已有几人替你说话。" },
      { id: "ask-mentor", label: "求座主援手", note: "消耗人情，较易过关", merit: [6, 16], eq: [1, 4], relation: [-4, 3], clean: -1, text: "你写信给座主求援。几日后风声稍缓，但这份人情日后总要偿还。" },
      { id: "counter", label: "反参政敌", note: "风险高，成功则扬名", merit: [12, 30], eq: [-2, 5], clean: -2, corruption: 1, impeachment: 0.18, text: "你搜集对方旧案反参上去。朝堂顿时热闹，胜负未分之前，人人都与你保持距离。" },
    ],
  },
  {
    id: "famine",
    title: "荒年赈济",
    minRank: 6,
    prompt: "连月不雨，乡民聚在县门前求粥。仓粮有限，上司又催你按额解送。",
    options: [
      { id: "open-granary", label: "开仓赈济", note: "民望大涨，仕途冒险", merit: [18, 34], virtue: [4, 8], favorability: [5, 10], clean: 5, relation: [-5, 0], text: "你开仓设粥棚，先救眼前饥民。百姓叩首称谢，上司的催文却一日紧似一日。" },
      { id: "donation", label: "劝捐赈灾", note: "考验人脉", merit: [14, 28], eq: [2, 6], favorability: [3, 7], clean: 2, relation: [1, 5], text: "你请士绅富户入堂饮茶，把利害说透。众人虽肉疼，终究凑出一批米粮。" },
      { id: "send-tax", label: "照额解送", note: "保官评，失民心", merit: [6, 16], virtue: [-6, -2], favorability: [-8, -3], clean: -2, corruption: 1, text: "你按额解粮，官样文章毫无破绽。只是县门外的哭声，在夜里仍能听见。" },
    ],
  },
  {
    id: "palace-visit",
    title: "御前问政",
    minRank: 15,
    prompt: "新帝召对，忽然问起地方积弊。殿中诸臣屏息，你只得当场作答。",
    options: [
      { id: "truth", label: "直陈利弊", note: "清名高，可能越级受赏", merit: [24, 48], knowledge: [2, 6], clean: 4, favorability: [2, 6], relation: [-2, 4], text: "你直陈钱粮、刑名与河工三弊，语气虽峻，却句句有据。御前沉默片刻，终点头命你另呈条陈。" },
      { id: "balanced", label: "折中陈奏", note: "稳健保身", merit: [16, 34], eq: [2, 6], clean: 1, relation: [2, 6], text: "你先称祖制，再言变通，既不伤旧臣颜面，也给新政留了余地。" },
      { id: "flatter", label: "顺旨逢迎", note: "关系快，身后名差", merit: [10, 24], eq: [1, 5], virtue: [-5, -2], clean: -4, corruption: 3, relation: [3, 8], text: "你顺着圣意把话说得圆满，殿上气氛轻松许多，只是史笔未必喜欢这种圆滑。" },
    ],
  },
];
const OFFICIAL_POST_CASE_DEFS = [
  { title: "朱批错漏", prompt: "一封发往乡里的公文抄错了赈粮数目，若照文执行会少发数十石。上司催你立刻封缄送出。", clean: "你拆封重校，主动领下迟误之责，赶在驿卒出城前改正文书。", balanced: "你让熟识书吏暗中换页，既补了错漏，也没有惊动满衙。", risky: "你照旧发文，打算把日后的亏空推给经手书吏。" },
  { title: "夜缉盐枭", prompt: "典史手下探得私盐船今夜靠岸，线报却可能是豪户借刀杀人。", clean: "你先验货路与船牌，再分两队包抄，擒到真犯而未扰无辜。", balanced: "你扣船审人，给几名受雇船工留了自首退路。", risky: "你与盐枭暗通消息，放走头目，只拿几个替罪者交差。" },
  { title: "户籍疑云", prompt: "主簿案头出现数十户同日迁入的户籍，背后似有人借名吞田。", clean: "你逐村核验保甲与旧契，查出豪族冒名占田的证据。", balanced: "你先冻结争议田亩，再请县令会同族老缓查。", risky: "你收下说情礼，把可疑户籍压进旧档。" },
  { title: "县仓霉粮", prompt: "县丞巡仓时发现新粮下面尽是霉谷，仓官却说开仓会耽误秋解。", clean: "你当众启仓重验，封存霉粮并追查采买亏空。", balanced: "你先调好粮顶上解额，再暗查仓官账簿。", risky: "你让仓官补一份孝敬，仍把霉粮混入解运。" },
  { title: "县学舞弊", prompt: "岁试前夕，有生员家长托人送来一份与考题相近的文章。", clean: "你当夜另拟考题，并将关节条子封存备查。", balanced: "你更换半数题目，私下警告涉事教习收手。", risky: "你默认文章流传，从中换取士绅支持。" },
  { title: "州狱积案", prompt: "州狱关押多人多年未审，旧卷残缺，属县又互相推诿。", clean: "你逐案复核口供与拘票，先释放证据不足者。", balanced: "你限属县一月补卷，挑最紧要的几案先结。", risky: "你按旧口供草草定罪，只求清空积案数字。" },
  { title: "灾民围衙", prompt: "水灾后饥民围在县衙外求粮，而上解漕粮的期限就在明日。", clean: "你开仓赈急并具文自请处分，先保百姓活命。", balanced: "你劝城中富户出粮，官仓只补不足之数。", risky: "你命差役驱散灾民，照额封船解粮。" },
  { title: "漕船梗阻", prompt: "数十艘漕船堵在州河，船户与河工互指对方索费误期。", clean: "你亲到河口丈量淤塞，重排船次并公开工食。", balanced: "你让商帮垫资疏浚，许其来年优先过闸。", risky: "你把过闸次序卖给出价最高的船帮。" },
  { title: "府州会审", prompt: "一桩命案三次翻供，知府催你在会审前给出定论。", clean: "你重勘现场与尸格，终于找出被忽略的时辰矛盾。", balanced: "你保留两说，请上官追加关键证人后再判。", risky: "你顺着权贵属意的方向定案，换取升迁荐语。" },
  { title: "盐引争夺", prompt: "两家大商争夺盐引，一家有部院靠山，一家能解地方燃眉之急。", clean: "你按资本、运力与历年信用公开核给盐引。", balanced: "你将盐引拆分，使两家相互牵制又都能办差。", risky: "你把大半盐引给了送礼最厚的一家。" },
  { title: "数县疫灾", prompt: "辖下三县疫病并起，药材不足，民间开始传言官府隐瞒死者。", clean: "你设医棚、报实数、禁哄抬药价，并请邻州驰援。", balanced: "你先封锁重疫乡里，再分批调药稳定城中。", risky: "你压下疫情文书，优先把药材供给富户大族。" },
  { title: "属县抗令", prompt: "两名知县联名拖延新政，声称地方财力已到极限。", clean: "你亲查两县钱粮，以实数修正过苛条目，也处分借口敷衍者。", balanced: "你准许分年施行，换取两县先办最急事项。", risky: "你借机勒索属县，谁送礼便替谁缓办。" },
  { title: "河盐兵备", prompt: "道内河工、盐务与兵备同时告急，三处都来争同一笔银子。", clean: "你按灾险轻重分配款项，并把账目张榜示众。", balanced: "你先救河工与兵备，令盐商垫付盐务周转。", risky: "你把款项拨给能替你在京中说话的一方。" },
  { title: "大狱翻案", prompt: "十年前的重案忽有新证，若翻案将牵连数名现任官员。", clean: "你封存原卷、保护证人，具奏请求彻查到底。", balanced: "你先秘密复审，待证据闭合再惊动朝廷。", risky: "你销毁新证，与涉案官员结成利益同盟。" },
  { title: "省库亏空", prompt: "藩库年终盘点少银数十万，历任交接文书却都写着无亏。", clean: "你冻结库门，分账复核并奏报历年积弊。", balanced: "你先追缴可追回的欠项，再给朝廷呈递补救章程。", risky: "你摊派各府填窟窿，自己也从中截下一份。" },
  { title: "封疆急报", prompt: "边地兵变与腹地水灾同日急报，朝廷只准先调一处钱粮。", clean: "你据军情与灾情实数分出轻重，同时自筹第二路赈饷。", balanced: "你先稳兵变，再命属省官绅合力救灾。", risky: "你选择最能替自己邀功的一路，另一处只发空文。" },
  { title: "数省军饷", prompt: "总督辖下数省军饷层层克扣，边军已有哗变之兆。", clean: "你越级查饷，裁撤空名，把现银直接发到营头。", balanced: "你与各省督抚议定限期补饷，暂不扩大追责。", risky: "你接受藩司分润，只查办几个无靠山的小官。" },
  { title: "六部新政", prompt: "尚书任上，皇帝命你拟一项牵动天下赋役的新政，朝中两派争执不下。", clean: "你调取各省实数，先行试点，再据成效修订成法。", balanced: "你保留旧制骨架，只在积弊最重处渐次改动。", risky: "你迎合圣意仓促铺开，并替亲信预留经办肥缺。" },
  { title: "内阁定策", prompt: "边战、灾荒与储位流言同时压到内阁，任何一句票拟都可能改变国运。", clean: "你以社稷为先，分别列明军国急务与不可逾越的法度。", balanced: "你联合数位阁臣拟出折中票旨，先稳朝局再图后策。", risky: "你借机排挤异己，把国事变成巩固权位的筹码。" },
];
const OFFICIAL_POST_CASES = OFFICIAL_POST_CASE_DEFS.map((item, rank) => ({
  id: `post-case-${rank}`,
  title: `${OFFICIAL_RANKS[rank].office} · ${item.title}`,
  minRank: rank,
  maxRank: rank,
  prompt: item.prompt,
  options: [
    { id: "upright", label: "秉公担责", note: "清名与政绩最佳，也可能得罪权势", merit: [14 + rank, 28 + rank * 2], virtue: [2, 6], clean: 4, favorability: [1, 5], relation: [-3, 2], text: item.clean },
    { id: "pragmatic", label: "权衡处置", note: "风险较低，政绩与人情较均衡", merit: [10 + rank, 22 + rank * 2], eq: [2, 5], clean: 1, relation: [1, 5], text: item.balanced },
    { id: "selfish", label: "借势谋私", note: "钱财与关系来得快，但可能遭弹劾", merit: [4, 12 + rank], money: [80 + rank * 12, 180 + rank * 24], virtue: [-7, -3], clean: -5, corruption: 5, relation: [2, 7], impeachment: Math.min(0.42, 0.12 + rank * 0.012), text: item.risky },
  ],
}));
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
  { id: "secrets", label: "奇闻", icon: "PrisonHeader", featured: true },
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
const BROTHEL_PORTRAITS = [
  "assets/brothel-pipa-v1.webp",
  "assets/brothel-dancer-v1.webp",
  "assets/brothel-poet-v1.webp",
  "assets/brothel-huakui-v1.webp",
];
const BROTHEL_ARCHETYPES = [
  { specialty: "琵琶", icon: "BambooFlute", specialtyText: "指下急雨落银瓶，最擅一曲边塞旧调。", background: "出身梨园，自幼随师学艺，最看重知音二字。" },
  { specialty: "舞袖", icon: "FlowerChiefTitle", specialtyText: "长袖回风，步步踩在鼓点与灯影里。", background: "随舞班辗转诸城，身段轻盈，也最懂席间分寸。" },
  { specialty: "诗词", icon: "Book", specialtyText: "临席成句，善把离合悲欢写进短笺。", background: "家道中落后入坊，仍藏着几卷旧书与一身傲气。" },
  { specialty: "花魁", icon: "FlowerChiefTitle", specialtyText: "琴棋书画俱精，最擅在谈笑间照顾满席宾客。", background: "连任数季花魁，见惯富贵场面，却很少向人说起真心话。" },
];
const BROTHEL_ACTIONS = {
  listen: { label: "听曲小坐", multiplier: 0.75, icon: "BambooFlute", diseaseRisk: 0 },
  banquet: { label: "夜宴谈心", multiplier: 1.25, icon: "Wine1", diseaseRisk: 0.03 },
  intimate: { label: "共度良宵", multiplier: 2, icon: "Whorehouse", diseaseRisk: 0.18 },
};
const CHILD_MARRIAGE_AGE = 18;
const CHILD_MARRIAGE_COST = 260;
const COURTESAN_REDEEM_AFFECTION = 82;
const COURTESAN_REDEEM_VISITS = 3;
const TEMPLE_FORTUNES = [
  { id: "noble", grade: "上上签", title: "云开见贵", verse: "云开月出照前程，旧识新知引路行。", interpretation: "来年将遇贵人相助，但是否受其提携仍看你的取舍。", icon: "Official" },
  { id: "wealth", grade: "上签", title: "财入东门", verse: "春水绕门添活计，一分胆识一分金。", interpretation: "来年会有一桩进财机会，稳取与冒险各有得失。", icon: "CashBox" },
  { id: "family", grade: "中上签", title: "灯火团圆", verse: "堂前灯暖人声近，旧隙逢春亦可消。", interpretation: "来年家中将有一场需要你居中料理的团圆事。", icon: "FamilyFriendAvatar" },
  { id: "study", grade: "中签", title: "砚池微澜", verse: "莫嫌纸上功夫慢，夜雨磨穿铁砚心。", interpretation: "来年会遇到一场考验学识与耐心的机会。", icon: "Book" },
  { id: "warning", grade: "下签", title: "风雨敲窗", verse: "行舟最怕滩头急，且把浮财换太平。", interpretation: "来年恐有破财或伤身之险，谨慎可将灾祸化小。", icon: "Temple" },
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
  { id: "world", label: "天下风云", icon: "Official", featured: true },
  { id: "home", label: "家中", icon: "FamilyIcon" },
  { id: "assets", label: "家产", icon: "House" },
  { id: "relations", label: "亲友", icon: "FamilyIcon" },
  { id: "activities", label: "活动", icon: "Activity" },
  { id: "culture", label: "华夏岁时", icon: "Temple" },
  { id: "secrets", label: "奇闻暗线", icon: "PrisonHeader", featured: true },
];

const EXAM_CHEAT_METHODS = [
  { id: "carry", name: "夹带小抄", cost: 35, boost: 1, risk: 22, heat: 12, note: "花费最低，只能多答一题；入场搜检最容易露馅。" },
  { id: "clerk", name: "买通书吏", cost: 180, boost: 2, risk: 16, heat: 20, extortion: 0.48, note: "书吏可替换号舍或递暗号，事后也可能拿把柄敲诈。" },
  { id: "substitute", name: "雇人顶替", cost: 680, boost: 99, risk: 20, heat: 45, severe: true, note: "成功几乎必取中；冒名一旦查出，会入狱并牵连家声。" },
  { id: "connections", name: "打通关节", cost: 1380, boost: 99, risk: 9, heat: 38, requireExaminer: true, note: "须先有足够人脉接近考官；考官仍可能临阵翻脸。" },
  { id: "buyExam", name: "中介买题", cost: 920, boost: 99, risk: 13, heat: 32, broker: true, note: "真假只在中介一念之间。真题可直上金榜，假题会让你满盘皆输。" },
];

const MYSTERY_CASES = [
  { id: "locked-room", title: "密室刺史", intro: "县令被发现死在反锁书房，窗栓完好，案上墨迹未干。妾室、师爷与管家各执一词。", guilty: "steward", suspects: [["concubine", "柳氏", "妾室"], ["adviser", "周师爷", "师爷"], ["steward", "何管家", "管家"]], clues: { autopsy: "伤口自下而上，凶器很可能藏在送炭的长钳中。", witness: "小厮听见管家在案发前以送炭为由进入书房。", scene: "门闩上缠着一根穿过墙洞的细丝，能从门外拉落。", records: "管家私吞公款，昨夜正要被县令发落。" } },
  { id: "ghost-bride", title: "鬼新娘", intro: "迎亲当日，新娘在轿中离奇死去，脸上带笑，喜服没有挣扎痕迹。", guilty: "doctor", suspects: [["groom", "裴新郎", "新郎"], ["maid", "阿绫", "陪嫁侍女"], ["doctor", "杜郎中", "郎中"]], clues: { autopsy: "死者齿间有甜杏气味，笑容是毒发后肌肉痉挛。", witness: "侍女说郎中送来一丸“定心丹”。", scene: "轿底发现蜡封药纸，印着杜家药铺暗记。", records: "郎中曾求娶被拒，并购入大量苦杏仁。" } },
  { id: "twins", title: "双生换命", intro: "一对双生兄弟一死一逃，活着的人自称弟弟，邻里却无法分辨。", guilty: "elder", suspects: [["elder", "顾伯安", "自称弟弟者"], ["wife", "秦氏", "兄长之妻"], ["partner", "陆掌柜", "生意伙伴"]], clues: { autopsy: "死者右手有常年握笔薄茧，应是从不识字的弟弟。", witness: "塾师记得兄长幼时左耳被戒尺划伤。", scene: "活人左耳果然有一道极淡旧疤。", records: "兄长欠下巨债，弟弟名下却刚继承田产。" } },
  { id: "gu", title: "蛊毒奇案", intro: "富商腹中发现异虫，家人认定是蛊术害命，南货铺与苗医都被围堵。", guilty: "cook", suspects: [["healer", "乌娘", "苗医"], ["cook", "郑厨子", "家厨"], ["merchant", "洪掌柜", "南货商"]], clues: { autopsy: "所谓蛊虫其实来自未熟河鱼，真正死因却是慢性砒毒。", witness: "厨下学徒见郑厨子每晚独自清洗药罐。", scene: "灶灰中筛出带砒霜气味的碎瓷。", records: "郑厨子之父二十年前被富商逼死。" } },
  { id: "headless", title: "无头河尸", intro: "河滩出现无头尸，三户人家同时认领。衣物、伤疤和失踪时间彼此矛盾。", guilty: "boatman", suspects: [["widow", "韩寡妇", "认尸妇人"], ["boatman", "蒋船户", "船户"], ["brother", "罗二", "结义兄弟"]], clues: { autopsy: "尸体脚底有长期踩湿船板形成的裂纹。", witness: "渡口孩童见蒋船户深夜独自拖走一只沉重麻袋。", scene: "衣内暗袋藏着另一家盐号的铜牌。", records: "死者真实身份是查私盐的暗差，蒋船户正在替盐枭运货。" } },
  { id: "old-revenge", title: "株连旧案", intro: "二十年前冤案相关者接连收到血字判词，其中一人已经死在祖祠。", guilty: "scribe", suspects: [["descendant", "沈遗孤", "旧案遗孤"], ["scribe", "范书吏", "旧案书吏"], ["priest", "玄尘", "游方道士"]], clues: { autopsy: "死者先被迷香放倒，血字写成时间晚于死亡。", witness: "守祠人看见范书吏持旧钥进入后门。", scene: "香炉底藏着被撕去一角的旧供词。", records: "范书吏当年伪造口供，如今杀人是为灭掉最后知情者。" } },
];

const JIANGHU_SKILLS = [
  { id: "qian", name: "千术", cost: 260, note: "可在博坊暗中出千，提高翻盘机会；被识破会重伤并入狱。" },
  { id: "face", name: "相面", cost: 180, note: "在街头替人相面，套出身份与心事，可赚人情或攀附权贵。" },
  { id: "fortune", name: "泄命卦", cost: 320, note: "批下一句三年后的命数。预言有真有假，兑现前无法确定。" },
  { id: "fakeMedicine", name: "假药局", cost: 220, note: "短期获利极快，也可能吃坏人后被苦主追查。" },
  { id: "impersonate", name: "冒充官差", cost: 360, note: "需备一身官差衣冠，招摇得利；被识破即按诈官入狱。" },
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
  { id: "jianghu", label: "江湖暗门", icon: "GamblingHouse", minAge: 15, note: "老千、相士与游方术士出没之处，来钱快，风声也紧。", special: "jianghu" },
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

const CAREER_ADVANCED_CASE_DEFS = {
  木匠: { title: "官宅危梁", prompt: "新修官宅上梁前忽见主梁内裂，东家催你按吉时完工，同行又怕担责。", choices: [["拆梁重作", "细查木性，宁误吉时也不留隐患。", "你逐寸验木，拆下暗裂主梁重新配榫。"], ["撑梁抢修", "凭体力与手艺当场加固，成败都在一线。", "你带众匠架起撑木，在吉时前完成换梁。"], ["劝主暂迁", "先安顿宅中老幼，再与东家讲明利害。", "你说服东家暂缓入住，也替同行争到返工余地。"]] },
  画师: { title: "失真祖容", prompt: "大族请你重绘祖容，各房却对先祖相貌与衣冠各执一词。", choices: [["考据旧像", "查族谱旧画，以笔墨还原可信形貌。", "你翻检残卷旧像，重新厘定冠服与眉目。"], ["当堂写神", "抓住各房共述的神韵，大胆另起新稿。", "你不拘残像，以众人口述写出先祖气度。"], ["调和各房", "先听完家族旧事，再让画中细节兼顾人情。", "你把各房珍重的记忆化进画面，平息了争执。"]] },
  玉匠: { title: "贡玉藏绺", prompt: "一块待琢贡玉外润内绺，强行开料可能尽毁，退料又会得罪货主。", choices: [["灯下辨绺", "慢磨细看，循石纹重新定形。", "你借灯透玉，沿暗绺改出一套小件。"], ["险刀取芯", "从裂隙间取正色玉芯，收益极高。", "你屏息下刀，直取玉心最净的一段。"], ["据实退料", "向货主讲明瑕疵，保住行规与客情。", "你当面标出每道暗绺，劝货主改作寻常器。"]] },
  琴师: { title: "御前断弦", prompt: "贵宴演奏前名琴忽然断弦，满座已静，主人只给你半刻钟。", choices: [["重校宫商", "换弦定音，以最稳妥的旧曲开席。", "你迅速换弦校音，以一支古调稳住全场。"], ["借断弦成曲", "将意外化进新声，临席即兴。", "你顺着断弦余响改奏，反添金石萧瑟之意。"], ["请众乐和声", "协调乐工分担声部，不让一人独担风险。", "你请笛箫接过空缺，众乐相和完成一曲。"]] },
  铁匠: { title: "军械急单", prompt: "边营催要一批刀枪，铁料却良莠不齐，交期与军士性命都压在炉前。", choices: [["逐件验火", "分料复锻，宁可慢些也保证刃口。", "你将杂铁重新分炉，逐件听声验刃。"], ["连炉抢锻", "昼夜不停开炉，以体力搏交期。", "你带徒弟轮班抡锤，炉火三日未熄。"], ["先修旧械", "先替急行军修好旧械，再补交新作。", "你先修复营中旧刀枪，让前队不至空手上阵。"]] },
  跑堂: { title: "雅间密账", prompt: "贵客散席后遗下一本密账，掌柜想邀功，陌生人又重金求你交出。", choices: [["封账还客", "不翻内容，按席签找到失主。", "你将账册原样封好，循席签送还失主。"], ["借账换赏", "利用账中线索争一笔大赏，风险极高。", "你看懂其中商路关节，带着账册去谈条件。"], ["交由掌柜", "让店中共同见证处理，避免独自涉险。", "你召掌柜与账房一同封存，留下多人见证。"]] },
  伙夫: { title: "百人中毒", prompt: "大宴开席前有人腹痛倒地，后厨众人都怀疑是新到的菌菇。", choices: [["封灶验食", "停席查料，逐锅排除问题。", "你立刻封灶留样，从砧板到汤锅逐一核查。"], ["另起百席", "弃掉全部成菜，以余料重做一桌。", "你推翻原席另起炉灶，带人从头赶制。"], ["先救食客", "先备解汤请医，再向宾客说明实情。", "你先熬解汤并请来郎中，稳住了慌乱宾客。"]] },
  车夫: { title: "雪夜急驿", prompt: "暴雪封道，车上既有救命药材，也有一位病弱乘客，近路正穿过险坡。", choices: [["绕官道行", "多走二十里，路稳但可能误时。", "你沿驿碑绕行官道，时时查看车轴马蹄。"], ["闯雪坡", "凭控马本事抢过险坡，最快也最危险。", "你勒紧缰绳冲入雪坡，在风口辨着旧车辙前行。"], ["分车送药", "托同业先送药，自己照看病客慢行。", "你请轻骑带药先走，自己生火护着病客。"]] },
  担夫: { title: "洪水断桥", prompt: "山洪冲断木桥，药铺急货必须送到对岸村中，同行都停在水边。", choices: [["结索渡货", "先探水势，架绳分批运送。", "你沿岸寻到老树结索，把药包一批批渡过。"], ["负重涉水", "趁水势未涨硬闯，速度快但伤身。", "你把货高高扎在背上，迎着急流一步步挪过去。"], ["组织乡民", "召集两岸人手搭便桥，共担风险。", "你喊来乡民递木传绳，很快搭起一条窄桥。"]] },
  禅师: { title: "寺产之争", prompt: "灾年里寺中只剩一仓粮，住持要留作香火，山门外却聚满饥民。", choices: [["立册施粥", "清点余粮按户施放，兼顾寺中老弱。", "你逐斗登记粮数，在山门外按户设粥。"], ["尽开粮仓", "先救眼前饥民，日后生计再想办法。", "你打开仓门尽数施粮，让寺众一同承担后果。"], ["募粮共济", "联络乡绅商户，以寺名筹集更多粮食。", "你登门劝募，又请受粮者参与煮粥维持秩序。"]] },
  厨娘: { title: "寿宴失味", prompt: "老夫人寿宴前忽染风寒，既不能食油腻，满堂宾客又等着体面席面。", choices: [["改制养生席", "按时令重排菜单，清淡而不失礼数。", "你以菌蔬鲜汤重排席面，滋味清雅层次分明。"], ["一灶双席", "同时做养生席与大宴，最考火候调度。", "你分开两灶掌火，让老夫人与宾客各得其味。"], ["问医定膳", "请郎中说明忌口，再劝主人简办。", "你请郎中列明禁忌，也说服主人不以铺张伤身。"]] },
  歌姬: { title: "禁曲点唱", prompt: "权贵在席上重金点唱一支牵涉旧案的禁曲，班主不敢拒绝也不敢应承。", choices: [["改词换意", "保留曲调，将犯忌旧词化为新意。", "你临场改词，把旧怨唱成一段惜时劝和。"], ["原曲直唱", "以唱功压住全场，名利与祸患并存。", "你按原词开嗓，席间从喧闹渐至鸦雀无声。"], ["婉辞救场", "另献一支更合席意的新曲，替班中解围。", "你笑称旧曲不合吉宴，转而献上刚排的新声。"]] },
  舞姬: { title: "临台折足", prompt: "领舞登台前扭伤脚踝，新舞阵势缺一人便会全乱。", choices: [["重排舞阵", "删去险步，以队形稳稳完成演出。", "你临场重排走位，让群舞掩住领舞空缺。"], ["带伤领舞", "忍痛完成最难一段，成则满堂惊艳。", "你束紧脚踝仍站上首位，将疼痛压进每次转身。"], ["启用新人", "把机会交给苦练已久的替补，并在幕后带拍。", "你推新人上场，自己在帘后击拍提醒。"]] },
  绣娘: { title: "嫁衣错纹", prompt: "大婚前三日，主家才发现嫁衣纹样触犯族中忌讳，整件重绣已来不及。", choices: [["拆线改纹", "逐针拆改，以细功补回吉纹。", "你连夜拆去犯忌纹样，用同色丝线改成并蒂莲。"], ["覆绣新章", "以大幅新纹覆盖旧样，耗神但可能成名。", "你大胆覆绣百鸟朝枝，让旧纹完全隐入层次。"], ["说明旧典", "查清纹样来历，调和两家对礼俗的分歧。", "你找来旧样册说明出处，也替双方换了几处细节。"]] },
  妆娘: { title: "宫宴失妆", prompt: "贵女入宫前突发红疹，厚粉会更伤皮肤，素面赴宴又恐失礼。", choices: [["薄妆遮瑕", "先护肤再以淡彩修饰，求稳妥自然。", "你用冷敷退红，只在眉眼与唇色上轻轻着笔。"], ["创制新妆", "借红疹改成花钿妆面，成败都很惹眼。", "你顺着红痕点出碎花钿，反成一套从未见过的新妆。"], ["坦言劝休", "以身体为重，劝贵女暂缓赴宴。", "你据实说明强妆之害，也替她备好告假礼数。"]] },
  闺塾师: { title: "代笔风波", prompt: "学生家长暗示你代写才女诗稿，好让女儿在诗会上扬名。", choices: [["循序改稿", "只教章法，让学生自己完成。", "你逐句讲解起承转合，最终仍由学生亲笔定稿。"], ["以稿立名", "亲自操刀写成佳作，短期名声可观。", "你替她写下一首工整佳作，并安排在诗会亮相。"], ["开小诗会", "让全班互评互改，以共同进步化解攀比。", "你在塾中先办小诗会，让每个学生都讲自己的句子。"]] },
  道士: { title: "古宅夜祟", prompt: "富户认定古宅闹祟，重金请你镇宅，你却在墙后听见活人的脚步声。", choices: [["勘宅查迹", "先查门窗地道，不急着谈鬼神。", "你沿墙灰与灯油痕迹查出一条暗道。"], ["设坛诱祟", "借法坛引暗中之人现身，稍有差池便会受伤。", "你故意将法事做得声势浩大，引得藏身者趁乱行动。"], ["安抚家眷", "先止住宅中恐慌，再联合乡邻守夜。", "你让家眷集中一处，安排乡邻分段巡守。"]] },
  守墓人: { title: "新坟异响", prompt: "连雨之后新坟中传出敲击声，族人都说亡者不安，无人敢近。", choices: [["查土听声", "从土层与排水判断坟内情形。", "你贴地辨声，发现墓侧积水压住了空棺木板。"], ["开坟救急", "冒着犯忌与塌方风险立即开坟。", "你带人掘开侧土，循敲击处破开墓室。"], ["请族人见证", "召集族老共同勘验，免生后续猜疑。", "你请族老焚香见证，再按规矩开土检查。"]] },
  摸金校尉: { title: "双门疑冢", prompt: "墓道尽头出现生死双门，一门有金气，一门却留着前人撤退的暗记。", choices: [["循记退探", "先读懂暗记与风向，保命为上。", "你逐个核对暗记，沿前人留下的安全线缓慢探查。"], ["破金门", "直取金气最盛之门，财险皆高。", "你定准金门机括，趁石锁回弹的一瞬钻入。"], ["封冢离开", "判断此墓凶险过甚，留下新记提醒后来人。", "你补全撤退暗记，封住盗洞并带同伴离开。"]] },
  弈师: { title: "赌局残局", prompt: "豪商设下重金残局，要求你让三子应战，输者还要背上作弊之名。", choices: [["细算收官", "避开诱杀，以稳健官子拖入细棋。", "你不理会开局挑衅，一点点追回目数。"], ["弃子屠龙", "主动弃子换先手，胜负立见。", "你连弃数子诱敌深入，忽然反手围住大龙。"], ["揭明局套", "指出残局暗藏的手脚，维护在场棋客。", "你请人重摆棋子，当众指出一枚被移过位置。"]] },
  茶师: { title: "贡茶受潮", prompt: "茶会前贡茶受潮生杂味，主人仍要你按原名奉客，免得失了体面。", choices: [["焙火醒茶", "分次低火复焙，尽量救回香气。", "你以文火反复醒茶，慢慢逼出湿气。"], ["调水斗茶", "用水温与器具掩去杂味，临席见真章。", "你改用山泉与厚盏，将涩杂压进回甘。"], ["换茶明说", "据实换用本地新茶，以诚意保住茶会。", "你向主人说明缘由，改奉一款清鲜本地茶。"]] },
};

const EXPANDED_DAILY_EVENT_DEFS = [
  [3, 8, "檐下燕巢", "春燕在檐下衔泥筑巢，一只雏燕却跌进院中。", [["搭梯送回", "你扶梯把雏燕送回巢里，袖口沾满泥点，心里却很安稳。", { virtue: 3, mood: 3 }], ["做个竹笼", "你把雏燕养在竹笼里日日照看，也因此懂得几分鸟兽习性。", { knowledge: 2, relationship: 1 }]]],
  [5, 12, "河灯失约", "伙伴约你夜里去河边放灯，家中长辈却叮嘱不可晚归。", [["早去早回", "你与伙伴趁暮色放了河灯，月上柳梢前便赶回家中。", { mood: 5, relationship: 3 }], ["留在家中", "你留下替长辈收拾院子，窗外灯影虽美，家中也很温暖。", { virtue: 4, mood: 1 }]]],
  [6, 14, "私塾罚站", "同窗把先生砚台碰落，却央你不要说出实情。", [["替他分担", "你与同窗一同认错罚站，从此他把你当作可信之人。", { relationship: 5, virtue: 1 }], ["据实说明", "你把经过说得清楚，先生未重罚任何人，只教你们各自担责。", { eq: 3, virtue: 3 }]]],
  [8, 16, "旧书夹信", "你在旧书摊翻到一本残卷，书页间夹着一封多年未寄出的家书。", [["寻访收信人", "你循着落款走了半座城，终于把迟到多年的家书送到白发老人手中。", { virtue: 5, relationship: 4, money: -8 }], ["留下研读", "你把残卷买回，信中旧事与书中批注让你读了许多个夜晚。", { knowledge: 5, money: -12 }]]],
  [12, 20, "雨夜借伞", "骤雨封街，屋檐下有一位陌生人冻得发抖，而你手中只有一把伞。", [["结伴同行", "你与对方共伞走过长街，一路谈起各自见闻。", { relationship: 4, eq: 3, mood: 2 }], ["将伞相赠", "你把伞留下，自己冒雨跑回家，次日却收到一包谢礼。", { virtue: 4, physique: -2, money: 25 }]]],
  [15, 28, "城门榜文", "城门新贴了一张招募告示，围观者都说此事报酬丰厚却来路不明。", [["细问来历", "你向守门兵、脚夫和商贩分别打听，发现告示背后另有一层盘算。", { eq: 5, knowledge: 2 }], ["揭榜一试", "你凭胆气接下差事，奔波数日，总算带着报酬平安归来。", { money: 90, physique: -3, mood: 3 }]]],
  [16, 35, "邻里夜争", "隔壁两家为一堵院墙争到深夜，族老也被吵得没了主意。", [["量地调解", "你找来旧契，又亲自量过墙基，替两家划出都能接受的界线。", { eq: 5, relationship: 5 }], ["闭门不理", "你不愿卷入邻里纷争，只把门窗关紧，任争吵持续到天亮。", { mood: -2, virtue: -1 }]]],
  [18, 45, "故友来投", "多年不见的旧友忽然登门，说生意失手，想借一笔盘缠东山再起。", [["借钱相助", "你把钱交给旧友，也请他写下用途与归期，情分之外仍留分寸。", { money: -80, relationship: 6, eq: 2 }], ["安排差事", "你没有直接给钱，而是替他找到一份短工，让他靠自己重新站稳。", { relationship: 4, virtue: 4 }]]],
  [18, 50, "市井冒名", "市集有人打着你的名号招摇买卖，已有商户登门追问。", [["当面对质", "你带着商户找到冒名之人，当街说清证据，也保住自己的名声。", { favorability: 4, eq: 4 }], ["暗中查访", "你不急着惊动对方，沿着货单查出背后一整条假货路子。", { knowledge: 3, money: 65 }]]],
  [20, 55, "荒年米价", "连日阴雨后米价忽涨，家中存粮尚足，邻巷穷户却已揭不开锅。", [["平价分粮", "你按户分出余粮，只收平日价钱，邻里都记下这份情。", { money: -60, virtue: 7, relationship: 5 }], ["留粮自保", "你把粮仓看得更紧，家中无虞，却不敢再听门外求借之声。", { mood: -3, virtue: -2 }]]],
  [22, 60, "酒楼错账", "酒楼结账时，伙计少算了你一大笔酒钱，同行朋友都没有察觉。", [["提醒伙计", "你叫住伙计补齐账目，掌柜后来特意送来一壶好酒致谢。", { virtue: 4, favorability: 2, money: -25 }], ["顺势离开", "你没有回头，省下一笔钱，夜里却总想起伙计焦急翻账的样子。", { money: 55, virtue: -4, mood: -2 }]]],
  [25, 65, "祖宅旧匣", "修整祖宅时，墙缝里掉出一只上锁木匣，匣上刻着陌生姓名。", [["召集亲族开匣", "你请亲族共同见证，匣中旧契补全了一段几乎失传的家史。", { knowledge: 5, relationship: 4 }], ["独自收存", "你独自打开木匣，里面除几件旧物，还有一小包前朝钱币。", { money: 120, mood: 2 }]]],
  [30, 70, "桥头义诊", "游方郎中在桥头义诊，却被药铺伙计指责坏了行规。", [["出钱买药", "你买下一批药材供郎中施用，也劝药铺把旧药平价出清。", { money: -90, virtue: 6, relationship: 3 }], ["居中定规", "你请双方约定每月义诊一日，其余时候照常经营，争执终于平息。", { eq: 6, favorability: 3 }]]],
  [35, 75, "冬夜失火", "更深时远处忽起火光，风正把火星吹向密集民宅。", [["提水救火", "你带人拆开火巷、接力提水，直到天亮才压住火势。", { physique: -5, virtue: 7, favorability: 5 }], ["护送老幼", "你不冒险冲进火场，只守住巷口把老人孩子一一送走。", { virtue: 5, relationship: 5 }]]],
  [40, 80, "旧怨登门", "一位多年未见的旧识带着当年的误会登门，言语仍不肯退让。", [["把话说开", "你取出旧信旧物逐件说明，两人沉默许久，终于肯各退一步。", { eq: 5, mood: 5, relationship: 3 }], ["以茶送客", "你没有再争旧事，只敬一盏茶送客，也算替往事画下句点。", { mood: 3, virtue: 2 }]]],
  [45, 90, "族谱缺页", "修族谱时发现一支旁系被整页抹去，族中老人对此讳莫如深。", [["追查旧事", "你走访数名老人，终于知道那一页背后是一场被掩盖的冤屈。", { knowledge: 6, virtue: 3 }], ["补名入谱", "你不再追究谁是谁非，只把失落姓名重新写回族谱。", { relationship: 6, virtue: 5 }]]],
  [55, 99, "少年问路", "一名迷惘少年登门请教，问你这一生究竟靠什么才走到今日。", [["讲成功之道", "你把几次得意与关键选择说给他听，也提醒运气从来不可复制。", { favorability: 4, knowledge: 2 }], ["讲失败之处", "你没有夸耀成就，只细说那些走错的路，少年听得格外认真。", { virtue: 5, mood: 3 }]]],
  [60, 99, "庭前旧物", "整理旧箱时，你翻出年轻时常带在身边的一件小物，许多往事忽然清晰。", [["留给晚辈", "你把旧物与它的故事交给晚辈，叮嘱他不必走与你完全相同的路。", { relationship: 6, mood: 4 }], ["独自珍藏", "你将旧物擦拭干净收回箱底，静坐半日，心中悲喜终于归于平静。", { mood: 7, virtue: 2 }]]],

  // —— 中晚年专属短剧（补足 45+ 事件密度）——
  [45, 75, "寿宴请柬", "邻里为你备下寿席请柬，有人劝你办得风光，也有人说家宴淡泊更真。", [["从简家宴", "你谢绝虚礼，只请至亲围桌小酌，笑语比锣鼓更入耳。", { mood: 6, relationship: 4, money: -40 }], ["开席待客", "你收下贺礼、开席款待，半城人都来敬酒，热闹却也耗神。", { favorability: 5, relationship: 5, money: -120, physique: -2 }]]],
  [46, 80, "孙儿抓周", "家中幼小满岁抓周，盘中摆着书、钱、剑、印，满屋人都屏住呼吸。", [["由他自抓", "你只笑看着孩子抓住一件小物，不问吉凶，只道机缘自在。", { mood: 5, virtue: 3, relationship: 3 }], ["略作引导", "你轻轻把书册推近一点，又怕太过强求，心里竟比科场还紧。", { knowledge: 2, mood: 3, relationship: 2 }]]],
  [48, 82, "子女争产", "子女为田宅份额争执起来，话里话外都等你一锤定音。", [["立据均分", "你请中人写清契据，份额公平，也把奉养写进文书。", { eq: 5, relationship: 2, virtue: 3, money: -30 }], ["暂缓不决", "你叹气道且再观望一年，争执暂时压下，却未真正散去。", { mood: -3, relationship: -2 }]]],
  [48, 85, "旧部来访", "昔年共事的后辈带着薄礼登门，说起当年一场险事仍心有余悸。", [["细说当年", "你把其中关节说与他听，他也道出你不知道的半截人情。", { knowledge: 3, relationship: 5, mood: 4 }], ["嘱他自重", "你少谈功劳，只叮嘱他居官处事要以人为念，勿蹈旧辙。", { virtue: 4, favorability: 3 }]]],
  [50, 88, "冬寒入骨", "连日阴冷，旧伤隐隐作痛，医者说要进补，也要少操劳。", [["遵医调养", "你按方服药、早睡少怒，数日后脚步竟稳了些。", { physique: 6, money: -70, mood: 2 }], ["硬撑出门", "你仍去料理外事，事情办了，夜里却咳到天明。", { eq: 2, money: 25, physique: -5, mood: -2 }]]],
  [50, 90, "祠堂落成", "族中集资修好支祠，请你题写匾额，也请你定下祭日规矩。", [["题匾立规", "你写下端正字迹，又定春秋两祭，族人多称稳妥。", { favorability: 5, knowledge: 4, knowledge: 3, money: -50 }], ["让贤避位", "你推说眼力不济，请更合适的人执笔，自己只坐末席见证。", { virtue: 4, relationship: 3, mood: 2 }]]],
  [52, 92, "重修家训", "晚辈常有口角，族老请你把家训重写一遍，贴在厅壁。", [["写宽厚二字", "你落笔多写忍让与互助，少写苛责，孩子们读了似有所悟。", { virtue: 6, relationship: 4 }], ["写勤学自立", "你把读书、作务、不欺暗室写得清楚，厅里忽然安静许多。", { knowledge: 3, virtue: 4, favorability: 2 }]]],
  [52, 95, "故人丧讯", "远方传来故友病逝的消息，匣中还有他多年前托付的一封未拆之信。", [["千里奔丧", "你带薄奠上路，灵前把信焚了，一路风尘却心安。", { virtue: 5, relationship: 3, physique: -3, money: -80, mood: -2 }], ["遥奠一炷", "你在城外寺中遥奠，把信读完又妥善收起，泪落而不失仪。", { virtue: 4, mood: 1, knowledge: 2 }]]],
  [54, 96, "致仕之议", "若你仍在任上，有人劝你及早求退；若你已闲居，也有人劝你再出山。", [["求退归田", "你把印绶心事放下，回家看竹听雨，反比往日清醒。", { mood: 6, virtue: 3, favorability: 2 }], ["再留一程", "你觉得事未做完，再撑一程，肩头虽重，却无人可替。", { eq: 3, knowledge: 2, physique: -2, favorability: 3 }]]],
  [55, 98, "义学开蒙", "乡里要办义学，缺束脩与先生，众人把目光投向你。", [["出资延师", "你拿出银钱请先生开课，春日里书声第一次漫过田埂。", { money: -150, virtue: 7, favorability: 5 }], ["亲自授句", "你隔日去教几个孩子认字，嗓子哑了，孩子们却记住了你。", { knowledge: 3, relationship: 5, virtue: 4, physique: -1 }]]],
  [55, 99, "重阳登高", "重阳将近，有人约你登高，也有人劝你在家饮菊花酒。", [["扶杖登山", "你走得慢，却走到半山亭，远望城郭，忽觉一生也不过如此一望。", { physique: 2, mood: 6, virtue: 2 }], ["家中对菊", "你在院中对菊小酌，听孙儿笑闹，比山顶风更暖。", { mood: 5, relationship: 4 }]]],
  [56, 99, "婚事主婚", "孙辈议亲，双方家长都请你出面主婚，礼数半点马虎不得。", [["从俗从厚", "你按礼备好聘仪与席面，亲家满意，家里也热闹几天。", { money: -180, relationship: 6, favorability: 3 }], ["去奢守礼", "你删去繁文，只留该有的礼数，省了银钱，也少了比较。", { money: -60, virtue: 4, eq: 3 }]]],
  [58, 99, "旧宅让出", "子女希望你搬到更清静的偏院，好把正屋给下一辈成家。", [["欣然让出", "你带着书箱迁到偏院，清晨反而更安静，适合抄书养性。", { mood: 4, virtue: 3, relationship: 4 }], ["讲明界限", "你同意腾屋，但把藏书室与药柜留下自用，大家各退一步。", { eq: 4, relationship: 2, mood: 2 }]]],
  [58, 99, "夜梦少年", "夜里梦见自己仍是少年，在巷口追逐，醒来枕席都湿了。", [["记入年谱", "你把梦境写进年谱，旁注“不必强求再得”，笔锋竟稳。", { knowledge: 3, mood: 4 }], ["庭中散步", "你披衣在院中走了几圈，看星光稀疏，心渐渐落回身子里。", { physique: 1, mood: 5 }]]],
  [60, 99, "县志采风", "修县志的人登门，要记你这一生功过与见闻，问得极细。", [["如实而谈", "你功过都说，不美化也不自污，记事人写得满满几页。", { favorability: 5, knowledge: 3, virtue: 2 }], ["只谈地方", "你少谈自己，多谈河工、米价与乡俗，反被称“有史识”。", { knowledge: 5, virtue: 3, favorability: 2 }]]],
  [60, 99, "膝下承欢", "孙儿缠着要听你年轻时的故事，问你可曾害怕、可曾后悔。", [["讲胆气", "你讲了一次冒险，孩子们眼睛发亮，你却补了一句“别学莽撞”。", { mood: 5, relationship: 4, favorability: 1 }], ["讲软肋", "你讲了一次认错与低头，厅里静了片刻，倒比英雄故事更贴肤。", { virtue: 5, relationship: 5, mood: 3 }]]],
  [62, 99, "药香满室", "你学会自己炮制几味安神药，邻里老人也来讨方。", [["广传验方", "你把稳妥的方子抄给众人，并写明禁忌，免得误用。", { virtue: 5, relationship: 5, knowledge: 2 }], ["谨慎自用", "你只给至亲与自己用，外来求方者婉拒，省去许多口舌。", { physique: 4, mood: 2, eq: 2 }]]],
  [62, 99, "河堤看水", "春汛将至，年轻人去河堤忙活，也有人请你这位“识水的”去看一眼。", [["拄杖巡堤", "你指出一处松软堤脚，民夫连夜补夯，事后都道亏你来了。", { knowledge: 4, favorability: 5, physique: -2 }], ["在家祈安", "你腿脚不便，只在家设香祈安，又派人送去茶水干粮。", { virtue: 3, relationship: 3, money: -25 }]]],
  [63, 99, "旧友重逢", "同窗老友忽然现身城中，须发皆白，一开口却仍是少年声口。", [["对酒夜话", "你们从私塾说到白头，笑与叹交错，直到更鼓三响。", { mood: 7, relationship: 5, money: -40 }], ["约后日聚", "你怕他劳顿，先安顿住处，约改日从容再叙。", { eq: 3, relationship: 4, virtue: 2 }]]],
  [64, 99, "分家文书", "你打算提前立下分家文书，免得身后兄弟阋墙。", [["当众宣读", "你请来族亲见证，条款读得清楚，虽有人默然，却无当场翻脸。", { eq: 5, virtue: 3, relationship: 1, money: -35 }], ["密存待启", "你写好封存，注明“身故后开”，眼下家中仍一团和气。", { mood: 3, knowledge: 2, virtue: 2 }]]],
  [65, 99, "庙会坐镇", "城隍庙会缺个有威望的坐镇人，会首三请你出面压场。", [["应允坐镇", "你坐在香案侧，喧闹中居然少了几起争执，会首送来酬金。", { favorability: 5, eq: 3, money: 60, physique: -2 }], ["荐人代劳", "你举荐更合适的人，自己只捐一笔香油钱。", { virtue: 4, relationship: 3, money: -45 }]]],
  [66, 99, "眼力渐昏", "抄书时字迹发虚，医者说要少耗神，多远望。", [["停抄养目", "你把笔搁下，每日远眺山色，眼倒清爽些。", { physique: 3, mood: 3 }], ["改授口耳", "你不再密抄，改把心得讲给晚辈听，反倒多了交流。", { knowledge: 2, relationship: 5, virtue: 2 }]]],
  [68, 99, "清明扫墓", "清明将至，家中商议谁去主祭、谁留守。", [["亲往主祭", "你虽走得慢，仍坚持到坟前三叩，回来后话少了，心却定。", { virtue: 5, relationship: 3, physique: -2, mood: 2 }], ["命子代祭", "你把祭文写好交予子女，自己在家静坐，遥想故人音容。", { relationship: 4, virtue: 3, mood: 1 }]]],
  [68, 99, "邻童偷果", "邻家孩童翻墙偷摘院中果子，被你撞见，吓得说不出话。", [["责而归还", "你要他赔礼并归还，又送一篮熟果给其母，孩子反而不敢再犯。", { eq: 4, virtue: 3, relationship: 3 }], ["笑而纵之", "你只说“下次走正门来讨”，孩子跑了，隔日却送来一包自家点心。", { mood: 4, relationship: 4, virtue: 2 }]]],
  [70, 99, "闲章一枚", "刻工送来一枚闲章，问你要刻“知足”还是“不悔”。", [["刻知足", "印面落“知足”二字，你盖在年谱末页，墨色沉静。", { mood: 6, virtue: 3 }], ["刻不悔", "你选了“不悔”，盖下时手微微颤，随即释然一笑。", { mood: 5, favorability: 2, virtue: 2 }]]],
  [70, 99, "夜闻更鼓", "城中更鼓一声声传来，你数着打更，想起半生在外的夜晚。", [["起身写记", "你把想说给后人的话写了半页，写完竟能安睡。", { knowledge: 3, mood: 4 }], ["默数入眠", "你不再追忆，只听鼓点如潮退，慢慢沉入梦里。", { physique: 2, mood: 5 }]]],
  [72, 99, "让贤议事", "族议时年轻人顶撞老规矩，有人要你压场，也有人要你退让。", [["压场立威", "你把旧例与利害说透，场上安静了，却也有人背后不服。", { favorability: 3, eq: 4, relationship: -1 }], ["退半步听", "你先让年轻人把话说完，再补关键处，争执化成商量。", { eq: 5, virtue: 4, relationship: 4 }]]],
  [72, 99, "冬至汤圆", "冬至做汤圆，孙儿把馅料弄得到处都是，厨房乱成一团。", [["一齐动手", "你挽袖入厨，面粉沾须也不恼，汤圆歪歪扭扭却很好吃。", { mood: 7, relationship: 6 }], ["在旁指点", "你坐在灶边指点火候，孩子们学会了，也学会了客气。", { knowledge: 2, relationship: 4, mood: 4 }]]],
  [74, 99, "托付遗物", "你开始把珍视的小物一一写上名字，准备将来交给该交的人。", [["写清缘由", "每件附一张纸条，写“因何给谁”，免去日后猜测。", { eq: 3, virtue: 3, mood: 3 }], ["只交心腹", "你只把最要紧的几件交给最信得过的人，其余随缘。", { relationship: 4, mood: 2 }]]],
  [75, 99, "雨声停时", "连下几日雨，今日忽然放晴，檐水滴答，像有人轻轻说话。", [["开窗晒书", "你把受潮的书页摊开，阳光一照，霉味散了，心也亮了。", { knowledge: 2, mood: 5, physique: 1 }], ["携幼踏水", "你带幼小去巷口看积水反光，他们笑，你也跟着笑。", { relationship: 5, mood: 6 }]]],
  [76, 99, "拒收寿礼", "有人借祝寿之名送礼请托，礼单上写着你不愿沾的名字。", [["原礼退回", "你把礼原封退回，并回信说明不便，夜里睡得反而踏实。", { virtue: 6, favorability: 2, eq: 3 }], ["转赠义仓", "你收下后转捐义仓，并让对方知晓，请托之事自然消了。", { virtue: 5, favorability: 4, relationship: 2 }]]],
  [78, 99, "最后一课", "你自觉精神尚可，想给晚辈讲最后一堂“处世课”。", [["讲宽恕", "你把最难的原谅讲给他们听，厅里久久无声。", { virtue: 6, relationship: 4, mood: 3 }], ["讲分寸", "你讲进退与边界，年轻人似懂非懂，却都认真记了。", { eq: 5, knowledge: 2, favorability: 2 }]]],
  [80, 99, "枕边低语", "夜里你与枕边人说起若有一天只剩一人，该如何把日子过稳。", [["互许从容", "你们约定不互相拖累到难堪，只求彼此心安。", { mood: 5, relationship: 5, virtue: 3 }], ["只谈眼前", "你不愿说远，只握紧对方的手，说“先把今夜过好”。", { mood: 6, relationship: 4 }]]],
  [82, 99, "听蝉知夏", "院中蝉声聒噪，有人嫌烦，你却听出了少年时的夏天。", [["与蝉同坐", "你搬椅坐到树下，听一声声噪到平静，竟无半点不耐。", { mood: 6, virtue: 2 }], ["教孙辨声", "你教孙儿辨不同蝉鸣，孩子们忽然觉得夏天很有学问。", { knowledge: 2, relationship: 4, mood: 4 }]]],
  [85, 99, "满屋灯火", "除夕将近，家中灯火通明，你坐在角落看几代人穿梭，忽然很轻。", [["举杯祝安", "你慢慢站起，只说一句“都好好的”，满屋应和。", { mood: 8, relationship: 6, favorability: 2 }], ["默默看着", "你不多话，只把这一幕记在心里，像把一幅画收进胸中。", { mood: 7, virtue: 3 }]]],
];

const CAREER_KIND_ADVANCED_CASES = {
  official: ["民情与成例", "一桩牵动百姓生计的旧案压到案头，成例、人情和上命彼此冲突。", [["循例细查", "先把案卷证据逐项核实。", "你没有急着定论，而是逐页复核旧案与地方成例。"], ["担责变通", "以官声和前程押一次大胆处置。", "你主动担责，绕开积弊替百姓争出一条活路。"], ["召集公议", "请乡老与同僚共同商议。", "你召集各方当堂陈情，让决定经得起众人追问。"]]],
  craft: ["名器与期限", "一位大主顾送来难得材料，却要求在极短期限内做成，同行都等着看成败。", [["拆解工序", "以经验稳稳推进每一步。", "你重新排定工序，宁可少睡也不省一道手艺。"], ["大胆试技", "用新法挑战材料极限。", "你把多年揣摩的新法用在这一件作品上。"], ["坦言协作", "联合同行共同完成。", "你请来最合适的同行分工，约定名利也按贡献分配。"]]],
  art: ["雅集争名", "城中雅集只留一个压轴席位，两位名家各有所长，主人要你当场拿出新作。", [["守住本色", "以最熟的技法稳住场面。", "你不逐浮名，只把最见功底的一段呈给众人。"], ["临席创新", "以新意博满堂惊艳。", "你顺着席间气氛临场改作，作品出人意料。"], ["合艺共演", "邀请另一位名家共同登场。", "你把争席变成合演，让彼此长处在一场作品中相映。"]]],
  service: ["满堂贵客", "店中同时来了官差、商队与寻常街坊，后厨堂前乱成一团。", [["分席定序", "先理清轻重缓急。", "你按来客所需重新分席，让每桌都有人照应。"], ["亲自周旋", "凭眼色在各桌之间救场。", "你一人穿梭堂前，把几场将起的争执都按了下去。"], ["照顾弱客", "先安顿老人孩子与病客。", "你先给最需要的人送上热汤，也请其他客人稍候。"]]],
  labor: ["险路重托", "一件急货必须穿过刚遭风雨的险路，货主加价催行，同行却劝你等待。", [["勘路再行", "先查路况再稳妥出发。", "你轻装探路，标出每一处塌方与歇脚点。"], ["抢时硬闯", "凭筋骨和经验争取高额报酬。", "你趁雨势稍歇立刻出发，咬牙闯过最险一段。"], ["召集同行", "分担货物与风险。", "你联合同行分段接力，让重货不必压在一人肩上。"]]],
  caravan: ["商路暗局", "一批高价货物的来历含糊，买家催你连夜启程，关卡又忽然增派人手。", [["验货改道", "先查货契，再选稳妥路线。", "你开箱验货、补齐契纸，宁可少赚也不留把柄。"], ["夜闯关道", "赌速度换取巨利。", "你趁换岗空隙催队疾行，把风险全押在一夜脚程上。"], ["联商作保", "请可靠商号共同担保。", "你找来旧商号验货作保，也把收益分出一份。"]]],
  mystic: ["真假异事", "一户人家重金求你处理怪事，你却发现恐惧、骗局与难言家事纠缠在一起。", [["察迹辨伪", "先查现场与人证。", "你从香灰、脚印与门锁处逐一找出人为痕迹。"], ["设局试探", "借仪式逼暗中之人露面。", "你故意设下声势浩大的仪式，引得作怪者自乱阵脚。"], ["安人心结", "先让家中众人说出隐情。", "你把众人请到一处，让压了多年的话终于说出口。"]]],
  female: ["名门急请", "大户在重要宴会前急请你献艺，既许重赏，也提出一项有损同行的条件。", [["守艺守约", "按本分完成委托，不涉同行是非。", "你只以技艺说话，把分内之事做到无可挑剔。"], ["借势扬名", "抓住机会推出从未示人的绝艺。", "你把压箱底的本事拿出来，一举成为席间焦点。"], ["替同行留路", "拒绝排挤条件，提出共同完成。", "你请同行一同入席，让这场委托不必靠踩人得名。"]]],
  common: ["东家难题", "东家临时交下一件棘手差事，做成有赏，做砸便要有人担责。", [["按部就班", "先理清步骤再动手。", "你把差事拆成数步，逐项完成没有留下纰漏。"], ["主动担责", "以个人本事争取更大回报。", "你把最难部分揽到自己身上，凭经验解决了意外。"], ["众人合力", "协调同伴共同处理。", "你把每个人擅长之处分配清楚，最终一同把差事办妥。"]]],
};

const CAREER_KIND_SKILLS = {
  craft: ["physique", "knowledge"],
  art: ["knowledge", "looks"],
  service: ["eq", "physique"],
  labor: ["physique", "eq"],
  mystic: ["virtue", "knowledge"],
  female: ["looks", "eq"],
  common: ["physique", "eq"],
};

const CAREER_SKILL_OVERRIDES = {
  木匠: ["knowledge", "physique"], 玉匠: ["knowledge", "eq"], 铁匠: ["physique", "knowledge"],
  画师: ["knowledge", "looks"], 琴师: ["knowledge", "eq"], 弈师: ["knowledge", "eq"], 茶师: ["eq", "knowledge"],
  伙夫: ["physique", "knowledge"], 厨娘: ["knowledge", "eq"], 歌姬: ["looks", "eq"], 舞姬: ["physique", "looks"],
  绣娘: ["knowledge", "looks"], 妆娘: ["looks", "eq"], 闺塾师: ["knowledge", "eq"],
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
  { id: "qingping", name: "清平县", cost: 8, days: 1, risk: 5, note: "县中街巷熟门熟路。", stat: "mood", icon: "Restaurant", landmark: "南市灯街", souvenir: "清平竹哨", story: "南市灯街入夜后摊火相连，最适合慢慢闲逛。", landmarks: ["qingping-street","qingping-temple"] },
  { id: "yunzhou", name: "云州", cost: 35, days: 3, risk: 18, note: "商旅云集，消息灵通。", stat: "eq", icon: "CarShop", landmark: "九门商栈", souvenir: "云州商牌", story: "九门商栈里口音纷杂，货单与传闻一样多。", landmarks: ["yunzhou-market","yunzhou-pass"] },
  { id: "luocheng", name: "洛城", cost: 55, days: 4, risk: 16, note: "书院林立，适合访学。", stat: "knowledge", icon: "BookStore", landmark: "白鹿书院", souvenir: "洛城拓片", story: "城西书院沿河而建，旧碑与藏书吸引四方士子。", landmarks: ["luocheng-academy","luocheng-garden"] },
  { id: "jiangling", name: "江陵", cost: 45, days: 4, risk: 20, note: "水路繁华，适合会友。", stat: "relationship", icon: "BambooFlute", landmark: "十里水埠", souvenir: "江陵绢扇", story: "十里水埠舟楫不断，夜里还有沿河弦歌。", landmarks: ["jiangling-wharf","jiangling-water"] },
  { id: "liangdu", name: "梁都", cost: 80, days: 6, risk: 25, note: "京畿气象，见闻最广。", stat: "virtue", icon: "Official", landmark: "朱雀御街", souvenir: "梁都宫笺", story: "朱雀御街宽阔笔直，官署、行会与百年老店并立。", landmarks: ["liangdu-gate","liangdu-canal"] },
  { id: "kunbei", name: "昆北府", cost: 68, days: 6, risk: 34, note: "北地雄城，胡汉商旅交错。", stat: "physique", icon: "RepairCarriage", landmark: "朔风马市", souvenir: "昆北马铃", story: "马市终日尘土飞扬，塞外皮货与良驹在此交易。", landmarks: ["yunzhou-pass","exile-border"] },
  { id: "sudi", name: "苏堤水乡", cost: 62, days: 5, risk: 14, note: "桥多水密，园林与丝坊闻名。", stat: "looks", icon: "Courtyard", landmark: "烟雨画桥", souvenir: "苏堤香囊", story: "画桥两岸粉墙黛瓦，雨落河面时最有江南意趣。", landmarks: ["jiangling-water","study-tour"] },
  { id: "qingya", name: "青崖山", cost: 48, days: 4, risk: 38, note: "山寺、药谷与险峰相连。", stat: "virtue", icon: "Temple", landmark: "云顶古寺", souvenir: "青崖平安结", story: "石阶穿云而上，半山药香与钟声常被雾气送来。", landmarks: ["study-tour","qingping-temple"] },
];

const TRAVEL_CARRIAGES = [
  { level: 1, name: "轻便驿车", comfort: 0, safety: 0, icon: "RepairCarriage", note: "车身轻，走近路尚可，遇烂路便颠簸。" },
  { level: 2, name: "四轮篷车", comfort: 6, safety: 8, price: 480, icon: "CarShop", note: "带篷布与储物格，远行更稳，也能多备行囊。" },
  { level: 3, name: "雕花暖车", comfort: 12, safety: 16, price: 1280, icon: "CarShop", note: "双马曳车、软垫暖炉，长途风雨也能从容。" },
];

const TRAVEL_SUPPLIES = [
  { id: "light", name: "轻装赶路", cost: 0, safety: 0, comfort: 0, note: "只带水囊干粮，省钱但应变有限。" },
  { id: "steady", name: "稳妥行囊", cost: 35, safety: 8, comfort: 3, note: "药囊、雨具、干粮齐备，适合普通远游。" },
  { id: "luxury", name: "锦囊暖食", cost: 95, safety: 14, comfort: 9, note: "带足热食、毯褥与备用车件，花费高却舒适。" },
];

const TRAVEL_ROUTE_EVENTS = [
  { id: "fork", title: "古驿岔路", prompt: "旧驿道在林前分成两支，一边路碑清楚却绕远，另一边留着新鲜车辙。", choices: [["循碑走官道", "knowledge", 42, "你按路碑与旧图稳稳走上官道。", "旧碑倒伏，你仍绕了半日。", { mood: -1 }, { mood: -3 }, 4], ["沿车辙抄近道", "eq", 58, "你问清沿途樵夫，近道果然省下脚程。", "车辙把你引到封闭山坳。", { mood: 3 }, { physique: -3 }, 7], ["停车辨方向", "knowledge", 35, "你登高看水势与炊烟，重新定下方向。", "雾气太重，只能回到原路。", { knowledge: 2 }, { mood: -1 }, 3]] },
  { id: "rain", title: "山雨压车", prompt: "乌云突然压过山脊，前方泥坡已经有车轮打滑。", choices: [["披蓑慢行", "physique", 45, "众人压住车尾，一步步挪过泥坡。", "车轮陷泥，费了许多气力才拖出。", { physique: 1 }, { physique: -4 }, 4], ["投宿避雨", "eq", 35, "你找到一户农家借宿，还听到不少乡间见闻。", "附近没有人家，只得在车中熬夜。", { relationship: 2, mood: 2 }, { mood: -2 }, 3], ["用银雇人护车", "eq", 28, "附近脚夫收下工钱，熟练地护车过坡。", "临时雇来的人手仍不够用。", { money: -18 }, { money: -18, physique: -2 }, 6]] },
  { id: "inn", title: "荒村客店", prompt: "天色将晚，路边客店灯火昏黄。掌柜热情招呼，同行却说此店从未见过。", choices: [["验过门牌再住", "knowledge", 46, "你看出店中虽旧，官验木牌却是真的。", "门牌是旧物挪用，夜里仍被偷去盘缠。", { knowledge: 2, mood: 2 }, { money: -35 }, 5], ["与商队合住", "eq", 42, "你与商队互相照应，还结识一位远方客商。", "商队自己也争吵不休，一夜未眠。", { relationship: 3 }, { mood: -2 }, 5], ["车中守夜", "physique", 48, "你守着车马平安熬到天明。", "夜寒入骨，次日精神不济。", { virtue: 1 }, { physique: -3 }, 3]] },
  { id: "festival", title: "途中乡会", prompt: "沿途村镇正逢乡会，社火、百戏与货摊堵住了驿道。", choices: [["停车看会", "mood", 30, "你随人群看完社火，也尝到当地吃食。", "人潮拥挤，随身小物被挤丢了。", { mood: 5, money: -12 }, { money: -25 }, 6], ["帮忙疏通车道", "eq", 44, "你帮乡老分开人车，两边都顺利通行。", "众人各说各话，车道反而更乱。", { favorability: 2, relationship: 2 }, { mood: -2 }, 6], ["绕村而过", "knowledge", 38, "你沿田埂找到一条清静小路。", "田埂尽头水渠阻路，只得折返。", { knowledge: 1 }, { mood: -2 }, 3]] },
  { id: "shrine", title: "古道小祠", prompt: "古道旁有一座无名小祠，香火虽淡，檐下却挂满过路人的平安牌。", choices: [["添香祈路", "virtue", 30, "你添香留名，心绪安稳许多。", "山风吹灭香火，只余一缕青烟。", { virtue: 2, mood: 2, money: -8 }, { money: -8 }, 4], ["查看旧碑", "knowledge", 45, "碑阴记着旧驿路线，恰好能避开前方险滩。", "碑文漫漶，你只辨出几个地名。", { knowledge: 3 }, { knowledge: 1 }, 6], ["替祠堂补瓦", "physique", 48, "你顺手补好漏瓦，守祠老人赠你一枚平安结。", "瓦片湿滑，忙了许久也未补牢。", { virtue: 3, relationship: 1 }, { physique: -2 }, 5]] },
  { id: "broken", title: "车轴异响", prompt: "车行半途，左轮车轴忽然发出细碎异响，再走下去可能折在荒野。", choices: [["就地检修", "knowledge", 48, "你卸轮加楔，把松动处重新箍紧。", "检修不彻底，车况又坏了几分。", { knowledge: 2 }, {}, 6], ["减载慢行", "physique", 38, "众人分担行李，车马轻装抵达下一驿。", "脚程拖慢，所有人都十分疲惫。", { physique: 1 }, { mood: -3 }, 4], ["赶往车马铺", "eq", 32, "你谈妥修价，老师傅很快换好车楔。", "最近车铺坐地起价，仍得咬牙修车。", { money: -28 }, { money: -48 }, 7]] },
];

const TRAVEL_LANDMARKS = [
  { id: "qingping-street", name: "清平街巷", region: "清平县", icon: "Activity", note: "故乡巷陌，檐下旧事最熟。" },
  { id: "qingping-temple", name: "清平古刹", region: "清平县", icon: "Temple", note: "县外香火，钟声可闻半里。" },
  { id: "yunzhou-market", name: "云州集市", region: "云州", icon: "BookStore", note: "商旅叫卖，货通四方。" },
  { id: "yunzhou-pass", name: "云州边关", region: "云州", icon: "Official", note: "烽火台下，风沙扑面。" },
  { id: "luocheng-academy", name: "洛城书院", region: "洛城", icon: "Book", note: "碑廊满是旧题，书声不绝。" },
  { id: "luocheng-garden", name: "洛城名园", region: "洛城", icon: "Jade", note: "曲水亭台，文人常聚。" },
  { id: "jiangling-wharf", name: "江陵码头", region: "江陵", icon: "RepairCarriage", note: "舟楫如织，夜灯映水。" },
  { id: "jiangling-water", name: "江南水乡", region: "江陵", icon: "Agriculture", note: "烟雨小桥，渔歌唱晚。" },
  { id: "liangdu-gate", name: "梁都城阙", region: "梁都", icon: "House", note: "宫墙高耸，车马不绝。" },
  { id: "liangdu-canal", name: "御河长堤", region: "梁都", icon: "Activity", note: "杨柳夹岸，仕女游春。" },
  { id: "caravan-mountain", name: "苍山栈道", region: "押镖途中", icon: "RepairCarriage", note: "栈道临渊，商队鱼贯而过。" },
  { id: "caravan-desert", name: "瀚海驿站", region: "押镖途中", icon: "CashBox", note: "黄沙漫漫，驿鼓声远。" },
  { id: "caravan-river", name: "大河古渡", region: "押镖途中", icon: "Restaurant", note: "渡口浊浪，船夫号子起伏。" },
  { id: "exile-border", name: "谪戍边城", region: "远谪", icon: "Official", note: "荒城落日，才知京华之远。" },
  { id: "study-tour", name: "游学名山", region: "游学", icon: "MainBook", note: "登山访碑，得半卷旧闻。" },
];

/** 诗会文斗：选项制对句 */
const POETRY_ROUNDS = [
  {
    upper: "海上生明月",
    options: [
      { text: "天涯共此时", good: true, note: "工整开阔，最称雅座。" },
      { text: "江上清风来", good: false, note: "意境尚可，对仗略偏。" },
      { text: "炉边煮新茶", good: false, note: "意象不接，座中窃笑。" },
      { text: "春色满皇都", good: false, note: "题意相左，难入法眼。" },
    ],
  },
  {
    upper: "大漠孤烟直",
    options: [
      { text: "长河落日圆", good: true, note: "气象雄浑，满座称善。" },
      { text: "小桥流水长", good: false, note: "江南情调，难配边塞。" },
      { text: "夜雨打窗纱", good: false, note: "纤细有余，气势不足。" },
      { text: "柳絮满春城", good: false, note: "春景虽美，与上联不谐。" },
    ],
  },
  {
    upper: "两个黄鹂鸣翠柳",
    options: [
      { text: "一行白鹭上青天", good: true, note: "色彩对仗，灵动可喜。" },
      { text: "三杯浊酒醉红尘", good: false, note: "情味有了，景致不对。" },
      { text: "四面楚歌起边关", good: false, note: "气势过重，失了轻盈。" },
      { text: "五更鸡鸣破残梦", good: false, note: "对仗勉强，意境散乱。" },
    ],
  },
  {
    upper: "窗含西岭千秋雪",
    options: [
      { text: "门泊东吴万里船", good: true, note: "时空开阔，气魄不俗。" },
      { text: "庭开南国一枝梅", good: false, note: "清雅有余，格局略小。" },
      { text: "案列东家半卷书", good: false, note: "太过琐碎，难称佳对。" },
      { text: "夜听北风打柴门", good: false, note: "冷意尚合，对仗不工。" },
    ],
  },
  {
    upper: "欲穷千里目",
    options: [
      { text: "更上一层楼", good: true, note: "简洁有力，余韵悠长。" },
      { text: "先饮一杯酒", good: false, note: "俏皮有趣，却失庄重。" },
      { text: "且听一夜雨", good: false, note: "意境尚可，气势不足。" },
      { text: "莫问百年愁", good: false, note: "伤感有余，对仗偏虚。" },
    ],
  },
  {
    upper: "野火烧不尽",
    options: [
      { text: "春风吹又生", good: true, note: "生机勃发，满座颔首。" },
      { text: "秋雨落还来", good: false, note: "意象近似，却少精妙。" },
      { text: "寒霜冻更坚", good: false, note: "气势反了，不合原意。" },
      { text: "明月照无眠", good: false, note: "题意游离，难称对句。" },
    ],
  },
  {
    upper: "落霞与孤鹜齐飞",
    options: [
      { text: "秋水共长天一色", good: true, note: "千古名对，压得满堂。", perfect: true },
      { text: "春潮带雨晚来急", good: false, note: "好句却非此联之对。" },
      { text: "孤舟蓑笠翁独钓", good: false, note: "景致冷清，对仗不齐。" },
      { text: "黄鹤一去不复返", good: false, note: "名句错位，座中失笑。" },
    ],
  },
  {
    upper: "劝君更尽一杯酒",
    options: [
      { text: "西出阳关无故人", good: true, note: "离情恰切，举座动容。" },
      { text: "东篱把酒黄昏后", good: false, note: "闲适太过，不合送别。" },
      { text: "南来北往皆过客", good: false, note: "通达有理，诗味稍薄。" },
      { text: "北风卷地白草折", good: false, note: "边塞气象，却非此对。" },
    ],
  },
];

/** 促织/博坊赛季称号 */
const CRICKET_SEASON_TITLES = [
  { id: "cricket-1", need: 1, name: "草根新鸣", desc: "本季首胜。" },
  { id: "cricket-3", need: 3, name: "连胜三场", desc: "本季大赛三捷。" },
  { id: "cricket-5", need: 5, name: "府城新魁", desc: "本季五场大赛。" },
  { id: "cricket-10", need: 10, name: "鸣冠一城", desc: "本季十场大赛。" },
];

const GAMBLE_SEASON_TITLES = [
  { id: "gamble-3", need: 3, name: "手气正旺", desc: "本季连胜三局。" },
  { id: "gamble-5", need: 5, name: "赌坊新贵", desc: "本季净胜五局。" },
  { id: "gamble-8", need: 8, name: "骰中闻名", desc: "本季净胜八局。" },
];

/** 联姻策略：家世档位 */
const MATCH_FAMILY_TIERS = [
  { id: "humble", name: "寒门", power: 12, fertility: 72, brideBase: 80, favor: 0, moneyYear: [0, 8], note: "门第虽薄，少许多应酬。" },
  { id: "small", name: "小户", power: 28, fertility: 66, brideBase: 160, favor: 1, moneyYear: [5, 20], note: "略有薄产，亲戚尚可走动。" },
  { id: "merchant", name: "商贾之家", power: 45, fertility: 60, brideBase: 320, favor: 2, moneyYear: [25, 70], note: "银钱活络，人情也杂。" },
  { id: "scholar", name: "书香门第", power: 52, fertility: 58, brideBase: 280, favor: 4, moneyYear: [10, 35], note: "知书达礼，利于仕学。" },
  { id: "gentry", name: "乡绅望族", power: 70, fertility: 55, brideBase: 480, favor: 6, moneyYear: [30, 90], note: "地方有声，婚后助力不小。" },
  { id: "noble", name: "官宦世家", power: 88, fertility: 50, brideBase: 720, favor: 10, moneyYear: [40, 120], note: "权势可借，也易卷入是非。" },
];

const MATCH_PERSONALITIES = [
  { id: "gentle", name: "温婉", mood: [1, 3], eq: [0, 1], conflict: 0.08, note: "性情和顺，持家得体。" },
  { id: "fiery", name: "刚烈", mood: [-1, 2], virtue: [0, 2], conflict: 0.22, note: "有主见，也好争执。" },
  { id: "clever", name: "机敏", eq: [1, 3], knowledge: [0, 2], conflict: 0.12, note: "心思活络，善解人事。" },
  { id: "plain", name: "朴实", virtue: [1, 3], money: [0, 15], conflict: 0.06, note: "勤俭持家，少生是非。" },
  { id: "shrewd", name: "精明", money: [10, 40], relationship: [-1, 1], conflict: 0.18, note: "会算计，也容易计较。" },
  { id: "aloof", name: "清高", knowledge: [1, 3], relationship: [-2, 1], conflict: 0.15, note: "雅致有余，人情略疏。" },
];

/** 秘密与身份（高风险可选） */
const SECRET_DEFS = [
  {
    id: "hidden-birth",
    name: "身世隐秘",
    icon: "Letter",
    risk: 0.07,
    acquireNote: "你得知并选择隐瞒一段不便示人的身世。",
    benefitNote: "暗中有人照应，偶有接济。",
    benefit: { money: [15, 55], mood: [-1, 2] },
    exposeTitle: "身世败露",
    exposeText: "旧事被人捅破，亲友侧目，你一时难以自处。",
    expose: { virtue: [-12, -6], favorability: [-18, -8], relationship: [-14, -6], mood: [-10, -4] },
  },
  {
    id: "fake-title",
    name: "假功名",
    icon: "MainBook",
    risk: 0.11,
    acquireNote: "你暗中顶着一纸假功名行走于人前。",
    benefitNote: "门户略好开，人情也抬几分。",
    benefit: { favorability: [2, 6], eq: [1, 3], money: [10, 40] },
    exposeTitle: "假功名败露",
    exposeText: "假功名事发，士林哗然，你声名扫地。",
    expose: { favorability: [-35, -18], virtue: [-18, -10], money: [-280, -80], mood: [-12, -5] },
    tag: "假功名",
  },
  {
    id: "bandit-tie",
    name: "通匪暗线",
    icon: "BlackMarket",
    risk: 0.1,
    acquireNote: "你与江湖暗线有了往来，银钱来得快，也危险。",
    benefitNote: "黑白两道偶有门路。",
    benefit: { money: [40, 140], eq: [1, 4], virtue: [-2, 0] },
    exposeTitle: "通匪事发",
    exposeText: "暗线被人咬出，官府查问，你险些下狱。",
    expose: { virtue: [-20, -10], favorability: [-25, -12], money: [-200, -60], mood: [-10, -4] },
    mayPrison: true,
    tag: "通匪嫌疑",
  },
  {
    id: "faction-remnant",
    name: "阉党余绪",
    icon: "Official",
    risk: 0.09,
    acquireNote: "旧年权门余党与你有了牵扯，升迁或有暗助。",
    benefitNote: "官场偶有人递话，也埋着祸根。",
    benefit: { favorability: [3, 8], eq: [1, 4], money: [20, 70] },
    exposeTitle: "余党牵连",
    exposeText: "阉党旧案重提，你被点名牵连，仕途人情一并受损。",
    expose: { favorability: [-30, -15], virtue: [-12, -6], eq: [-6, -2], mood: [-10, -4] },
    tag: "余党嫌疑",
  },
  {
    id: "illicit-child",
    name: "私生子隐情",
    icon: "FamilyIcon",
    risk: 0.08,
    acquireNote: "你私下安置了一段不为人知的骨肉之事。",
    benefitNote: "心中有牵挂，也偶得慰藉。",
    benefit: { mood: [1, 4], relationship: [1, 3], money: [-25, -5] },
    exposeTitle: "私情败露",
    exposeText: "私生子之事传开，家中起了风波，你颜面尽失。",
    expose: { relationship: [-20, -10], virtue: [-14, -6], mood: [-14, -6], favorability: [-12, -5] },
    tag: "家丑",
  },
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

/** 华夏岁时：传统节日与完整二十四节气。时代与地域习俗有别，叙事采用广为流传的共同传统。 */
const CULTURAL_SEASONS = {
  spring: { name: "春", color: "#6c9a61", note: "生发 · 耕作 · 踏青" },
  summer: { name: "夏", color: "#b86a4d", note: "长养 · 避暑 · 祛疫" },
  autumn: { name: "秋", color: "#b38a43", note: "收成 · 团圆 · 登高" },
  winter: { name: "冬", color: "#667f91", note: "收藏 · 祭祖 · 迎年" },
};

const SOLAR_TERMS = [
  ["lichun", "立春", "spring", "东风解冻，草木将萌", "迎春、戴春胜、尝春盘", "顺应生发，早起舒展"],
  ["yushui", "雨水", "spring", "冰雪渐消，春雨润物", "占稻色、护田畴、备农具", "避湿护脾，衣被勿骤减"],
  ["jingzhe", "惊蛰", "spring", "春雷动，蛰虫始振", "蒙鼓皮、扫虫蚁、劝耕", "清淡饮食，防春困"],
  ["chunfen", "春分", "spring", "昼夜相半，寒暑平", "校日晷、踏青、放纸鸢", "起居有常，调和身心"],
  ["qingming", "清明", "spring", "气清景明，百卉萌发", "扫墓祭祖、插柳、踏青", "慎终追远，也亲近春光"],
  ["guyu", "谷雨", "spring", "雨生百谷，农事渐忙", "种谷点豆、赏牡丹、采新茶", "祛湿健脾，惜春惜谷"],
  ["lixia", "立夏", "summer", "万物并秀，暑气初成", "称人、尝新、悬蛋囊", "养心静气，午间小憩"],
  ["xiaoman", "小满", "summer", "麦粒渐满，尚未大熟", "祭车神、看麦梢、修水渠", "清热祛湿，不贪生冷"],
  ["mangzhong", "芒种", "summer", "有芒之谷可种，梅雨将至", "送花神、煮青梅、抢收抢种", "劳作张弛有度"],
  ["xiazhi", "夏至", "summer", "日长之至，阳盛阴生", "祭地、食夏至面、量日影", "避烈日，护津液"],
  ["xiaoshu", "小暑", "summer", "热气渐盛，尚未极暑", "晒书画、尝新米、纳凉", "少动多静，饮食洁净"],
  ["dashu", "大暑", "summer", "暑热至极，雷雨亦多", "饮伏茶、晒伏姜、送清凉", "防暑湿，顾惜体力"],
  ["liqiu", "立秋", "autumn", "凉风渐至，禾谷将熟", "贴秋膘、啃秋、候凉风", "早卧早起，润燥养肺"],
  ["chushu", "处暑", "autumn", "暑气至此而止", "开渔、放河灯、晒秋", "昼夜温差渐大"],
  ["bailu", "白露", "autumn", "露凝而白，秋意分明", "收清露、酿米酒、采十样白", "添衣润燥，勿露身"],
  ["qiufen", "秋分", "autumn", "昼夜再相半，秋色平分", "祭月、竖蛋、校秤量收成", "收敛心神，劳逸相宜"],
  ["hanlu", "寒露", "autumn", "露气寒冷，将欲凝霜", "赏菊、登高、制秋茶", "护足添衣，温润饮食"],
  ["shuangjiang", "霜降", "autumn", "气肃霜降，草木黄落", "赏红叶、吃柿、备冬藏", "防寒润燥，少食辛辣"],
  ["lidong", "立冬", "winter", "水始冰，万物收藏", "祭祖、补冬、修仓廪", "敛藏精气，早卧晚起"],
  ["xiaoxue", "小雪", "winter", "寒气增，初雪未盛", "腌菜、制腊味、围炉", "温补不过燥"],
  ["daxue", "大雪", "winter", "雪势渐盛，天地闭藏", "藏冰、赏雪、修屋济寒", "避寒护阳，行路谨慎"],
  ["dongzhi", "冬至", "winter", "日短之至，一阳来复", "祭祖、贺冬、食馄饨或饺饵", "安静休养，护心防寒"],
  ["xiaohan", "小寒", "winter", "寒意已深，岁暮将近", "画梅数九、备年货、试腊味", "避风寒，固护脾肾"],
  ["dahan", "大寒", "winter", "寒气至极，轮回将启", "尾牙、除旧、糊窗迎岁", "藏养待春，勿过劳"],
].map(([id, name, season, phenology, customs, care]) => ({ id: `term-${id}`, name, type: "term", season, phenology, customs, care }));

const TRADITIONAL_FESTIVALS = [
  ["yuanri", "元日", "winter", "岁首更新，家门从旧年走入新年", "燃爆竹、贴桃符、拜年贺岁", "年糕与屠苏酒"],
  ["renri", "人日", "winter", "正月初七相传为人之生日", "戴人胜、登高赋诗、食七菜羹", "七菜羹"],
  ["yuanxiao", "上元灯节", "winter", "正月望日，灯火与月色同明", "张灯、猜谜、踏歌、观百戏", "元宵或浮圆子"],
  ["chunshe", "春社", "spring", "乡里祭社祈求风调雨顺", "祭社、分社肉、饮社酒", "社饭与社肉"],
  ["shangsi", "上巳", "spring", "暮春临水祓禊，踏青游春", "修禊、曲水流觞、佩兰", "春蔬与清酒"],
  ["hanshi", "寒食", "spring", "禁火冷食，亦寄慎终追远之意", "禁火、扫墓、插柳、踏青", "冷粥与青团类点心"],
  ["duanwu", "端午", "summer", "仲夏祛疫禳灾，也纪念忠烈", "竞渡、佩香囊、悬艾草、系五色丝", "角黍与雄黄酒"],
  ["qixi", "七夕", "summer", "星河相会，亦是女子乞巧之夕", "穿针乞巧、晒书晒衣、拜双星", "巧果"],
  ["zhongyuan", "中元", "autumn", "慎终追远，普度孤魂", "祭祖、放河灯、施食", "时果与素供"],
  ["zhongqiu", "中秋", "autumn", "三秋之半，望月思亲", "拜月、赏桂、团圆夜宴", "月饼与桂花酒"],
  ["chongyang", "重阳", "autumn", "九月九日登高避灾，敬老延寿", "登高、簪菊、佩茱萸、敬老", "重阳糕与菊花酒"],
  ["xiayuan", "下元", "autumn", "岁暮前修斋祈福、谢过解厄", "祭水官、修斋、祈福", "糍粑与素食"],
  ["laba", "腊八", "winter", "岁末腊祭，合聚百谷谢岁", "祭祖敬神、施粥、泡腊八蒜", "腊八粥"],
  ["xiaonian", "祭灶", "winter", "送灶神上天言事，家家开始除尘", "祭灶、扫尘、剪窗花", "灶糖"],
  ["chuxi", "除夕", "winter", "旧岁至此而除，家人守岁待旦", "祭祖、贴门神、团年、守岁", "年夜饭"],
  ["huachao", "花朝", "spring", "百花生日，惜春护花", "赏红、扑蝶、踏青咏花", "花糕与春茶"],
].map(([id, name, season, meaning, customs, food]) => ({ id: `festival-${id}`, name, type: "festival", season, meaning, customs, food }));

const CULTURAL_CALENDAR_ITEMS = [...SOLAR_TERMS, ...TRADITIONAL_FESTIVALS];

/** 牢狱年度事件；数值由专门结算器处理，避免普通事件无法表达减刑、狱中关系等状态。 */
const PRISON_YEAR_EVENTS = [
  {
    id: "rules", title: "点名立规", content: "木牌点过姓名，{guard}用棍梢敲着栅门，要新来的先学牢里的规矩。{cellmate}低声提醒：这里一言一饭都有价钱。",
    firstYear: true,
    choices: [
      { title: "低头守规", note: "稳妥求生，狱卒好感上升", text: "你按规矩领衣、认铺、应点，不与人争一时长短。", effects: { mood: -2, eq: 2 }, prison: { guardFavor: 6, reputation: -1 } },
      { title: "替弱者出头", note: "赢狱友敬重，也可能挨板子", text: "你拦下抢夺病囚口粮的人，背上挨了两棍，却让通铺都记住了你。", effects: { physique: -5, virtue: 4 }, prison: { inmateFavor: 9, reputation: 7 } },
      { title: "暗递碎银", note: "花钱换一处干净铺位", text: "你悄悄递出碎银，换到离便桶稍远的一角，也少受几分刁难。", cost: 45, effects: { mood: 3 }, prison: { guardFavor: 10 } },
    ],
  },
  {
    id: "cell-order", title: "通铺争位", content: "连日阴雨，墙根返潮。牢头要把{cellmate}赶到最湿的角落，众人都等你表态。",
    choices: [
      { title: "与牢头讲理", note: "情商与声望越高越有利", text: "你不硬碰，只把每人的病情和铺位说得分明，最终劝牢头重排通铺。", effects: { eq: 2, mood: 1 }, prison: { inmateFavor: 7, reputation: 4 } },
      { title: "让出自己的铺", note: "损体魄，得人心", text: "你把干处让给病弱者，自己靠墙熬了几夜，咳嗽声却换来一碗热水。", effects: { physique: -4, virtue: 5 }, prison: { inmateFavor: 10 } },
      { title: "装作没看见", note: "保全自己", text: "你裹紧薄被转过身去。牢里无人责怪，可也无人再与你多说。", effects: { mood: -2 }, prison: { inmateFavor: -5, reputation: -2 } },
    ],
  },
  {
    id: "labor", title: "狱作劳役", content: "天未亮便开锁，今日要搓麻绳、舂米并修补囚衣。做得快能添半勺稀粥，偷懒则要记过。",
    choices: [
      { title: "埋头做足份额", note: "增长劳作技能与体魄", text: "你找准省力的节奏，一日下来手掌磨破，却渐渐练出筋力。", effects: { physique: 2, mood: -1 }, prison: { laborSkill: 8, guardFavor: 3 } },
      { title: "帮狱友补份额", note: "结交狱友", text: "你替发热的{cellmate}多搓两捆麻绳，夜里对方把珍藏的半块盐饼分给你。", effects: { virtue: 3, relationship: 2 }, prison: { inmateFavor: 8, laborSkill: 4 } },
      { title: "藏下一截麻绳", note: "高风险，可能加刑", text: "你把麻绳藏入墙缝，想着日后或有用途；这件事一旦搜出，便不是挨打那么简单。", effects: { eq: 2 }, prison: { reputation: 4 }, risk: { chance: 0.34, failText: "夜间搜监时麻绳败露，你被按作图谋越狱，加刑一年。", sentence: 1, effects: { physique: -7, mood: -6 }, guardFavor: -12 } },
    ],
  },
  {
    id: "sick-inmate", title: "病囚夜喘", content: "半夜里{cellmate}高热不退，喊狱卒却无人应。角落只有一碗冷水和你藏下的旧布。",
    choices: [
      { title: "整夜照料", note: "积德，也有染病风险", text: "你替对方擦汗喂水，挨到天明终于等来狱医。", effects: { virtue: 5, mood: -1 }, prison: { inmateFavor: 12 }, risk: { chance: 0.2, failText: "病气传到你身上，之后数日也发起热来。", effects: { physique: -6 } } },
      { title: "拍门求医", note: "消耗狱卒人情", text: "你反复拍门，直到{guard}骂骂咧咧地带来狱医。人救下了，你也欠了一份人情。", effects: { relationship: 1 }, prison: { guardFavor: -4, inmateFavor: 7 } },
      { title: "隔开铺位", note: "保住体魄，损狱友情分", text: "你用破席隔开铺位，牢里人明白你的顾虑，却还是冷了眼神。", effects: { physique: 1, mood: -2 }, prison: { inmateFavor: -8 } },
    ],
  },
  {
    id: "guard-extort", title: "狱卒索钱", content: "{guard}说外头有人托话，却先把手伸进栅门：没有茶钱，家书便只能压在案底。",
    choices: [
      { title: "花钱取信", note: "支付银钱，收到家书", text: "碎银换来一封皱巴巴的家书。字不多，却让铁窗外的日子重新有了形状。", cost: 80, effects: { mood: 6, relationship: 3 }, prison: { guardFavor: 6, letters: 1 } },
      { title: "据理拒绝", note: "守住德行，得罪狱卒", text: "你指出收押文册的规矩，拒绝出钱。家书仍被扣下，{guard}也记住了你的脸。", effects: { virtue: 3, mood: -3 }, prison: { guardFavor: -10, reputation: 3 } },
      { title: "请狱友转递", note: "依赖狱中人缘", text: "你托出工的狱友绕过值房带回口信，虽只有一句“家中尚安”，也足够宽心。", effects: { mood: 3, eq: 2 }, prison: { inmateFavor: -2, letters: 1 } },
    ],
  },
  {
    id: "informant", title: "密告之诱", content: "同监有人私藏铁片。{guard}暗示，只要你指出藏处，往后的饭食与考功都能好看几分。",
    choices: [
      { title: "据实密告", note: "讨好狱卒，彻底得罪狱友", text: "搜监很快找到铁片。你多得一勺饭，却发现通铺从此无人与你对视。", effects: { virtue: -4, mood: -1 }, prison: { guardFavor: 12, inmateFavor: -16, reputation: -5 } },
      { title: "劝其交出", note: "需要声望，兼顾双方", text: "你连夜劝藏铁片的人主动交出，最终只记轻过，也未酿成更大祸事。", effects: { eq: 4, virtue: 3 }, prison: { guardFavor: 4, inmateFavor: 5, reputation: 6 } },
      { title: "守口如瓶", note: "获狱友信任，承担牵连风险", text: "你没有开口。铁片后来被别人搜出，众人敬你守信，狱卒却把你列入疑册。", effects: { mood: -2 }, prison: { inmateFavor: 10, guardFavor: -8, reputation: 4 } },
    ],
  },
  {
    id: "prison-books", title: "残卷入监", content: "抄没旧物中混进半部残书，纸角被虫蛀去。识字的人少，{cellmate}请你把上面的律例和故事念给众人听。",
    choices: [
      { title: "讲读残卷", note: "增长学识与狱中声望", text: "你把难字拆开讲，又以旧案解释律文。铁窗下一时竟像简陋书塾。", effects: { knowledge: 5, virtue: 2 }, prison: { inmateFavor: 7, reputation: 8 } },
      { title: "查找申诉门路", note: "积累翻案线索", text: "你逐条找出复审、亲供与刑名程序，把有用段落默记在心。", effects: { knowledge: 4, eq: 2 }, prison: { appeal: 12 } },
      { title: "撕纸换口粮", note: "短期保身，损失名声", text: "你用残页包针线换来两块干粮，填了肚子，却让盼着听书的人失望。", effects: { physique: 3, virtue: -3 }, prison: { inmateFavor: -6 } },
    ],
  },
  {
    id: "riot", title: "监中哗变", content: "发霉的囚粮终于激起众怒，木碗砸向栅门。有人抢钥匙，有人缩在墙根，{guard}已召来持棍差役。",
    choices: [
      { title: "护住弱小", note: "有受伤风险，声望大增", text: "你把老弱病囚护到墙角，没有参与抢门，也没有任他们遭踩踏。", effects: { virtue: 6, physique: -4 }, prison: { inmateFavor: 10, guardFavor: 3, reputation: 9 } },
      { title: "协助平乱", note: "狱卒记功，狱友记恨", text: "你帮差役夺回钥匙，事后被记作有功，却也成了不少人眼中的叛徒。", effects: { favorability: 2, virtue: -2 }, prison: { guardFavor: 14, inmateFavor: -14 }, sentence: -1 },
      { title: "趁乱逃狱", note: "极高风险；失败加刑", text: "你盯上半开的侧门，在烟尘与叫喊里赌一次自由。", prison: { reputation: 5 }, risk: { chance: 0.72, successText: "你冲过侧门，却在外墙前停步折返。主动回监让狱官从轻处置，反得一次减刑。", sentenceSuccess: -1, failText: "你刚翻上外墙便被弩手喝止，跌落受伤并加刑两年。", sentence: 2, effects: { physique: -12, favorability: -8 }, guardFavor: -20 } },
    ],
  },
  {
    id: "appeal", title: "秋审申诉", content: "刑名文册将送上复核。若要申诉，只剩今夜能托{guard}递出状纸；你积下的律例见识与狱中口碑都可能派上用场。",
    choices: [
      { title: "据律写状", note: "学识与申诉积累越高越有利", text: "你把案情、证词矛盾与应复核之处一条条写清，托人送入秋审案卷。", effects: { knowledge: 3 }, prison: { appeal: 8 }, test: "appeal" },
      { title: "请狱友联名", note: "依靠狱中人缘", text: "几名见过案情始末的狱友按下指印，证明你在狱中守规无恶。", effects: { relationship: 2 }, prison: { inmateFavor: -4 }, test: "inmates" },
      { title: "暂不妄动", note: "避免申诉失败招来报复", text: "你收起状纸，决定等更可靠的证据。机会错过，却也没有惊动旧案中的人。", effects: { mood: -2 }, prison: { appeal: 2 } },
    ],
  },
  {
    id: "new-year", title: "铁窗岁除", content: "外城爆竹声隔着高墙传来。狱里每人多得半块杂面饼，{cellmate}用草梗在墙上摆出一个歪斜的“福”字。",
    choices: [
      { title: "分食守岁", note: "与狱友共度除夕", text: "众人把各自那点食物凑在一起，说起家乡年俗，直到更鼓过夜半。", effects: { mood: 5, relationship: 2 }, prison: { inmateFavor: 8 } },
      { title: "写信报平安", note: "给家人留下音讯", text: "你在粗纸上只写平安，不写苦楚。信能否送到未知，心里却像点起一盏灯。", effects: { mood: 3, virtue: 2 }, prison: { letters: 1, guardFavor: -2 } },
      { title: "独坐反省", note: "增长德行与申诉意志", text: "你听着远处爆竹，逐件回想走到今日的因果，默记出狱后最先要做的三件事。", effects: { virtue: 5, knowledge: 2 }, prison: { appeal: 4 } },
    ],
  },
  {
    id: "mid-autumn", title: "囚窗望月", content: "中秋月从气窗移到墙上，只留下巴掌大一块亮。有人想家落泪，有人强说月亮不过一块白石。",
    choices: [
      { title: "讲一段故乡", note: "抚慰众人", text: "你讲起家中桂树、旧院与团圆饭，旁人也接着说自己的故乡，冷牢渐有了人声。", effects: { mood: 3, relationship: 2 }, prison: { inmateFavor: 7, reputation: 3 } },
      { title: "吟诗对月", note: "增长学识", text: "你借那一线月光吟出旧句。字句不一定工整，却让众人安静许久。", effects: { knowledge: 4, mood: 2 }, prison: { reputation: 5 } },
      { title: "以饼换信", note: "舍口粮换家书消息", text: "你把今日加发的粗饼交给出工囚犯，请他替你探一声家中近况。", effects: { physique: -2, mood: 5 }, prison: { letters: 1 } },
    ],
  },
  {
    id: "cold-wave", title: "寒潮封监", content: "北风从砖缝灌入，水缸结了一层薄冰。官仓迟迟不发冬衣，咳嗽声一夜比一夜密。",
    choices: [
      { title: "合铺取暖", note: "同舟共济", text: "你提议把铺位并拢，又轮流守夜添草，终于熬过最冷的几晚。", effects: { physique: 1, mood: 2 }, prison: { inmateFavor: 7, reputation: 4 } },
      { title: "拆席塞缝", note: "增长劳作技能", text: "你拆开破席与麻绳，把最漏风的砖缝逐处塞紧，手艺救了半监的人。", effects: { knowledge: 2 }, prison: { laborSkill: 7, inmateFavor: 5 } },
      { title: "向狱卒讨衣", note: "狱卒好感决定代价", text: "你向{guard}反复陈说冻死囚犯会坏了考成，终于领到几件旧棉衣。", effects: { eq: 3 }, prison: { guardFavor: -4, reputation: 3 } },
    ],
  },
];

/** 天下并非静止背景：国运、朝局与地方民生会逐年变化，并反过来影响各条人生路线。 */
const DYNASTY_ERA_NAMES = ["景和", "承熙", "泰宁", "元祐", "绍兴", "隆平", "乾元", "永昌"];
const RULER_TEMPERAMENTS = [
  { id: "diligent", name: "勤政宽仁", note: "重农恤民，国库消耗较快" },
  { id: "reformer", name: "锐意新政", note: "改革有力，也容易激化党争" },
  { id: "martial", name: "尚武拓边", note: "边军强盛，徭役军费亦重" },
  { id: "suspicious", name: "多疑峻刻", note: "朝局压抑，告讦与清洗增多" },
  { id: "indulgent", name: "宴安怠政", note: "权臣坐大，地方贪墨渐盛" },
];
const WORLD_FACTIONS = {
  reformers: { name: "新政派", note: "主张整饬吏治、兴修水利" },
  conservatives: { name: "守成派", note: "重祖制、轻变法，根基深厚" },
  military: { name: "边军勋贵", note: "掌兵权与军需，受边患牵动" },
  court: { name: "近侍权门", note: "通内廷消息，善于攀附权势" },
};
const WORLD_INCIDENTS = [
  { id: "harvest", title: "五谷丰登", text: "数州报来丰收，漕船满载入仓，市中米价渐平。", effects: { prosperity: [4, 8], treasury: [2, 5], "local.grainPrice": [-12, -6], "local.sentiment": [3, 7], "local.disaster": [-6, -2] } },
  { id: "flood-warning", title: "河汛告急", text: "上游连日暴雨，河堤渗水，沿岸百姓已经开始搬运粮物。", effects: { stability: [-5, -2], treasury: [-5, -2], "local.grainPrice": [8, 18], "local.disaster": [10, 19], "local.sentiment": [-7, -3] } },
  { id: "border-raid", title: "边烽骤起", text: "边骑越塞劫掠，驿路加急，朝廷开始征发军粮与车马。", effects: { stability: [-7, -3], treasury: [-8, -3], borderThreat: [10, 18], "local.grainPrice": [5, 13], factions: { military: [5, 10] } } },
  { id: "anti-corruption", title: "御史巡按", text: "朝廷遣御史分巡诸道，数名贪官落马，地方胥吏一时收敛。", effects: { stability: [2, 6], corruption: [-12, -6], "local.security": [3, 8], "local.sentiment": [2, 6], factions: { reformers: [4, 8], court: [-7, -3] } } },
  { id: "palace-spending", title: "大修宫苑", text: "内廷兴建园苑，奇木巨石沿河而下，民间又添一层徭役。", effects: { treasury: [-13, -7], corruption: [5, 11], stability: [-6, -2], "local.sentiment": [-9, -4], factions: { court: [5, 9] } } },
  { id: "epidemic", title: "时疫流行", text: "城南先起热病，药铺门前排起长队，乡间也陆续传来病讯。", effects: { prosperity: [-7, -3], "local.epidemic": [14, 24], "local.sentiment": [-6, -2], "local.grainPrice": [3, 8] } },
  { id: "trade-open", title: "互市重开", text: "边关议和后重开互市，皮货、茶盐与马匹重新流通。", effects: { prosperity: [5, 10], treasury: [3, 7], borderThreat: [-9, -4], "local.grainPrice": [-5, 1], factions: { military: [-3, 2] } } },
  { id: "bandit-suppression", title: "清剿盗匪", text: "官军与乡勇合围山寨，商旅渐敢夜宿驿亭，乡路重新热闹起来。", effects: { stability: [3, 7], "local.security": [8, 15], "local.sentiment": [2, 5], treasury: [-5, -2] } },
];
const WORLD_ARCS = {
  flood: {
    name: "大河决口",
    icon: "RepairCarriage",
    stages: [
      { title: "河声压城", content: "暴雨昼夜不歇，东堤裂开数丈。流民、粮价与官府的催令同时涌来，这不再是一场能等过去的雨。", choices: [
        { title: "先救人再守堤", note: "耗费钱粮，民心与长线评价最高", text: "你把能调动的人手先用于转移老弱，又连夜装土守住第二道堤。", cost: 90, score: 2, approach: "relief", effects: { virtue: 5, favorability: 4, mood: -2 }, world: { "local.disaster": -8, "local.sentiment": 8, treasury: -3 } },
        { title: "囤粮待价", note: "短期获利，可能在后续被追查", text: "你抢在封路前收走市面余粮，灾民的哭声与账上的进项一同增长。", score: -2, approach: "profit", effects: { money: 190, virtue: -7, favorability: -4 }, world: { corruption: 4, "local.grainPrice": 18, "local.sentiment": -8 } },
        { title: "护住自家撤离", note: "稳妥保身，对大局帮助有限", text: "你先把家人、文书与细软迁到高处，再回望浊浪吞没低田。", cost: 35, score: 0, approach: "caution", effects: { physique: 2, mood: -3 }, world: { "local.disaster": -2 } },
      ] },
      { title: "赈粮失踪", content: "朝廷赈粮到了县界，开仓时却少了三成。粮商、胥吏和押运人互相推诿，灾民已在仓门外聚集。", choices: [
        { title: "追查仓册", note: "官员与读书人更擅长；得罪地方势力", text: "你逐页比对仓单、船脚与封条，终于找出被改写的三处数目。", score: 2, approach: "investigate", effects: { knowledge: 4, eq: 2, favorability: 3 }, world: { corruption: -7, "local.sentiment": 5 } },
        { title: "另购粮米补缺", note: "商旅路线更擅长；花钱最快止饥", text: "你绕过争讼，从邻州连夜调粮，先让粥棚重新冒起热气。", cost: 150, score: 2, approach: "supply", effects: { virtue: 5, relationship: 3 }, world: { "local.grainPrice": -10, "local.sentiment": 7, prosperity: 2 } },
        { title: "设棚诊治疫病", note: "医者更擅长；防止灾后大疫", text: "你把净水、隔离和药材安排在粥棚旁，先压下最危险的一轮热病。", cost: 80, score: 2, approach: "healing", effects: { virtue: 6, physique: -2, favorability: 4 }, world: { "local.epidemic": -12, "local.sentiment": 5 } },
      ] },
      { title: "水退之后", content: "河水终于退下，田地覆着淤泥，朝廷使者也来核验功过。你这一年半所做的事，将决定重建从哪里开始。", choices: [
        { title: "修渠复耕", note: "着眼来年收成，国运恢复最稳", text: "你组织清淤、补渠并按户分发种粮，让荒地重新有了犁痕。", cost: 100, score: 2, approach: "rebuild", effects: { virtue: 5, favorability: 4 }, world: { prosperity: 7, "local.disaster": -10, "local.grainPrice": -8 } },
        { title: "呈报全部真相", note: "清算贪墨，可能卷入朝局", text: "你把赈粮亏空与灾情原貌一并上呈，不替任何人遮掩。", score: 2, approach: "truth", effects: { knowledge: 3, virtue: 4, favorability: 2 }, world: { corruption: -9, stability: 3, factions: { reformers: 5, court: -4 } } },
        { title: "领功后抽身", note: "保住已有收益，重建较慢", text: "你交清手中差事，把赞誉与争议一并留给后来者。", score: 0, approach: "exit", effects: { money: 70, mood: 3 }, world: { "local.sentiment": -2 } },
      ] },
    ],
  },
  succession: {
    name: "宫闱易主",
    icon: "Official",
    stages: [
      { title: "上不视朝", content: "天子久病不朝，储位诏书迟迟未下。京中每封书信都比往日更短，地方官与豪族也在暗问风向。", choices: [
        { title: "守法度不站私门", note: "稳定最高，但短期无人提携", text: "你只认公开诏令与官署程序，拒绝替任何私门递话。", score: 2, approach: "law", effects: { virtue: 5, favorability: 2 }, world: { stability: 5, corruption: -3 } },
        { title: "投向新政派", note: "押注改革；成败取决于后续朝局", text: "你与主张整饬财政的士人互通声气，把前程押在新政上。", score: 1, approach: "reformers", effects: { knowledge: 3, eq: 2 }, world: { factions: { reformers: 9, conservatives: -4 } } },
        { title: "攀附近侍权门", note: "收益直接，败露会留下污点", text: "你送出重礼，换来几句内廷消息，也把名字留在权门账簿上。", cost: 160, score: -1, approach: "court", effects: { money: 100, virtue: -5 }, world: { corruption: 7, factions: { court: 10 } } },
      ] },
      { title: "两诏并出", content: "深夜里两道诏书先后传出，所立之人竟不相同。城门封闭，军营换防，谁都知道天亮前必须作出选择。", choices: [
        { title: "护住官仓与百姓", note: "不争宫门，防止地方先乱", text: "你召集乡勇守住粮仓与街巷，严禁趁乱抢掠，让城中先安稳下来。", score: 2, approach: "public", effects: { virtue: 6, favorability: 5, physique: -2 }, world: { "local.security": 10, "local.sentiment": 8, stability: 3 } },
        { title: "查验诏书印信", note: "依靠学识寻找真伪证据", text: "你从纸张、用印与传递时刻入手，发现其中一道诏书沿用了废印。", score: 2, approach: "investigate", effects: { knowledge: 6, eq: 2 }, world: { stability: 4, corruption: -4 } },
        { title: "静候胜负", note: "风险较低，也会失去话语权", text: "你闭门谢客，不接任何名帖，等宫门尘埃自行落定。", score: 0, approach: "caution", effects: { mood: -2 }, world: { "local.sentiment": -2 } },
      ] },
      { title: "新朝第一道诏", content: "新帝终于御殿，第一道诏书要定的是赦免、税赋与旧臣去留。曾经的站队和沉默，都在名单上留下痕迹。", choices: [
        { title: "请减徭薄赋", note: "为民请命，改善地方恢复", text: "你上书陈说民力未复，请先减免一年徭赋，再议宫室与征伐。", score: 2, approach: "relief", effects: { virtue: 5, favorability: 4 }, world: { prosperity: 5, "local.sentiment": 8, treasury: -5 } },
        { title: "助新朝清理旧账", note: "提升秩序，也可能扩大清算", text: "你参与核查旧臣案卷，坚持以实证定罪，尽量不让私怨混进诏狱。", score: 2, approach: "law", effects: { knowledge: 4, eq: 3 }, world: { stability: 6, corruption: -6 } },
        { title: "借换朝谋取位置", note: "个人收益高，国中贪墨上升", text: "你拿出早已准备好的名帖和银钱，在新旧交替间换得一席之地。", cost: 120, score: -1, approach: "profit", effects: { money: 260, virtue: -6, favorability: -2 }, world: { corruption: 8, factions: { court: 6 } } },
      ] },
    ],
  },
  border: {
    name: "边关烽火",
    icon: "RepairCarriage",
    stages: [
      { title: "征发军需", content: "边关三烽连举，州县奉命征集粮草、药材与车马。有人看到报国之机，也有人只看见一门生意。", choices: [
        { title: "按实筹措军需", note: "官员、商旅与工匠有职业加成", text: "你按市价采买并逐车验封，不让霉粮与空箱混入军需。", cost: 110, score: 2, approach: "supply", effects: { virtue: 4, favorability: 4 }, world: { treasury: -3, borderThreat: -5, corruption: -3 } },
        { title: "随军救治伤患", note: "医者路线效果最好", text: "你带上药材与净布赶往军驿，先教民夫处理箭创与污水。", cost: 70, score: 2, approach: "healing", effects: { virtue: 6, physique: -3, knowledge: 3 }, world: { borderThreat: -3, "local.epidemic": -7 } },
        { title: "抬价售卖物资", note: "赚取战财，败坏地方民心", text: "你借征发之急抬高车马与粮价，账面大赚，乡里却开始咒骂。", score: -2, approach: "profit", effects: { money: 240, virtue: -8, favorability: -5 }, world: { corruption: 6, "local.grainPrice": 15, "local.sentiment": -8 } },
      ] },
      { title: "败兵入城", content: "前线一战失利，伤兵与难民挤满城门。谣言说敌骑已过三十里，市面开始抢购粮盐。", choices: [
        { title: "开门分流安置", note: "考验组织与地方治安", text: "你按籍贯、伤病与亲属分流入城者，设粥棚也设巡夜队，避免恐慌变成踩踏。", score: 2, approach: "public", effects: { eq: 4, virtue: 5, favorability: 4 }, world: { "local.security": 7, "local.sentiment": 8, "local.grainPrice": -5 } },
        { title: "探明前线军情", note: "体魄与商路经验更有帮助", text: "你随熟悉小路的向导出城，确认敌军只是游骑，主力尚未南下。", score: 2, approach: "scout", effects: { physique: -4, knowledge: 4 }, world: { borderThreat: -6, stability: 3 } },
        { title: "封门只保城内", note: "守住治安，但城外伤亡增加", text: "你主张紧闭城门，市内暂时安稳，城外的哭喊却整夜未停。", score: -1, approach: "caution", effects: { virtue: -5, mood: -3 }, world: { "local.security": 4, "local.sentiment": -9 } },
      ] },
      { title: "和战之议", content: "朝廷使者来到边城，要在增兵决战与议和互市之间定策。军功、国库与百姓生计各有一套道理。", choices: [
        { title: "先固边再议和", note: "兼顾防务与长期互市", text: "你主张修堡、清点军籍后再开谈判，不以空城求和，也不为虚名冒进。", score: 2, approach: "balanced", effects: { knowledge: 3, eq: 4 }, world: { borderThreat: -8, stability: 5, treasury: -4 } },
        { title: "力主互市休兵", note: "恢复商路，勋贵势力下降", text: "你列出军费与民生账目，请以互市、质子和边界巡检换取休兵。", score: 2, approach: "trade", effects: { virtue: 4, favorability: 4, money: 50 }, world: { prosperity: 7, borderThreat: -10, factions: { military: -5 } } },
        { title: "请战求取军功", note: "高风险高名望，边患可能加剧", text: "你认为敌军可一战而破，主动请战，把前程押在最后一场胜负上。", score: 0, approach: "war", effects: { favorability: 6, physique: -7 }, world: { borderThreat: 5, treasury: -8, factions: { military: 7 } } },
      ] },
    ],
  },
};
const NPC_AMBITIONS = ["求安稳", "置办家业", "读书进身", "经商致富", "行医济人", "远游见世", "光耀门楣"];
const NPC_DISPOSITIONS = ["重情", "谨慎", "进取", "刚直", "圆融", "节俭", "豪爽"];
const NPC_OCCUPATIONS = ["务农", "经营小铺", "书塾助教", "药铺帮工", "衙门书手", "工坊学徒", "往来行商"];

const RELATION_ACTIONS = {
  visit: { label: "探望", cost: 0, relationship: [1, 4], affection: [3, 8], mood: [1, 4], icon: "FamilyIcon" },
  gift: { label: "送礼", cost: 120, relationship: [2, 6], affection: [8, 16], mood: [0, 3], icon: "Jade" },
  borrow: { label: "借钱", cost: 0, relationship: [-6, -2], affection: [-10, -3], money: [80, 220], icon: "CashBox" },
  care: { label: "照料", cost: 60, relationship: [2, 6], affection: [6, 14], physique: [1, 4], icon: "MedicineBag" },
  talk: { label: "夜话", cost: 0, relationship: [1, 4], affection: [4, 9], mood: [2, 6], icon: "SendLetter", partnerOnly: true },
  outing: { label: "同游", cost: 45, relationship: [2, 6], affection: [5, 11], mood: [3, 8], icon: "RepairCarriage", partnerOnly: true },
  intimate: { label: "同房", cost: 0, relationship: [1, 4], affection: [5, 12], mood: [4, 9], icon: "ArrangeMarriage", partnerOnly: true },
};

const PARTNER_STORIES = {
  talk: [
    "灯下只留一盏茶，你们说起家中收支、儿女功课与近日烦忧，许多隔阂在夜话里慢慢散去。",
    "夜深后院寂静，对方把白日里不便说的话一一讲给你听，你也难得放下身份认真回应。",
    "你们翻看旧日家书，说到初识时的窘态都笑了起来，屋中气氛比往日温柔。",
  ],
  outing: [
    "你们换了便服去逛灯市，同看杂耍、共尝新点心，回程时一路还有说不完的话。",
    "城外春色正好，你们沿堤缓行，在柳荫下歇脚，把官场家事暂时抛在身后。",
    "你带对方去瓦舍听了一折旧戏，曲终后两人仍为戏中人物争论不休。",
  ],
  gift: [
    "你挑了一件合心意的礼物送去，对方嘴上说你破费，收下时眉眼却藏不住欢喜。",
    "这份礼不算奢华，却正是对方念叨许久的小物，显然你把那些闲话都记在心里。",
  ],
  care: [
    "对方近来精神不济，你请医问药又亲自照看，几日后气色终于好了些。",
    "你推掉外间应酬留在家中照料，对方把这份体贴记得很深。",
  ],
  intimate: [
    "红烛低照，你们洗去一日疲惫，是夜同房，共度良宵。次日醒来，彼此更多了几分亲近。",
    "夜雨敲窗，你留宿房中与对方相拥而眠。帘外风声不断，屋内却难得安稳。",
    "你们屏退侍从，关门共叙枕边话，随后同房歇下。这一夜不谈外事，只作寻常夫妻。",
  ],
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

const ACHIEVEMENT_TIERS = {
  bronze: { label: "铜", name: "铜章", scoreLabel: "初试锋芒" },
  silver: { label: "银", name: "银章", scoreLabel: "立身有成" },
  gold: { label: "金", name: "金章", scoreLabel: "传世奇闻" },
};

const LIFE_GOALS = [
  { id: "first-career", tier: "bronze", title: "安身立命", icon: "CashBox", desc: "拥有一份固定营生。", score: 60, done: () => !!state.career, advice: "15 岁后到营生页谋一份差事。" },
  { id: "first-exam", tier: "bronze", title: "童试入场", icon: "Book", desc: "参加一次正式科举。", score: 50, done: () => state.exam.attempts > 0 || officialExamHistory().length > 0, advice: "15 岁后去书院参加童试。" },
  { id: "exam-fail", tier: "bronze", title: "名落孙山", icon: "Book", desc: "第一次科举未中。", score: 45, done: () => officialExamFailures() > 0, advice: "考试失利也会增长经验，温课后再来。" },
  { id: "first-prison", tier: "bronze", title: "铁窗一梦", icon: "PrisonHeader", desc: "第一次入狱或留下牢狱记录。", score: 50, done: () => state.prisonYears > 0 || state.tags.includes("入狱") || logHas(/入狱|牢狱|余刑/), advice: "有些路走错一次，命册里也会记住。" },
  { id: "first-friend", tier: "bronze", title: "结交一人", icon: "Relationship1", desc: "拥有第一位朋友。", score: 45, done: () => (state.friends || []).some((friend) => friend.alive !== false), advice: "去会友、酒楼或活动里认识新人。" },
  { id: "first-child", tier: "bronze", title: "成家立室", icon: "FamilyIcon", desc: "成婚或拥有子女。", score: 100, done: () => !!state.family.spouse || livingChildren().length > 0, advice: "16 岁后去媒人处相看，或经营亲友关系。" },
  { id: "landed", tier: "bronze", title: "置办家产", icon: "House", desc: "拥有至少一处家产。", score: 110, done: () => (state.assets || []).length > 0, advice: "攒够钱后进入家产页置办田宅铺面。" },
  { id: "first-cricket", tier: "bronze", title: "草间听斗", icon: "Cricket", desc: "拥有促织或参加过斗促织。", score: 45, done: () => (state.crickets || []).length > 0 || cricketWins() + cricketLosses() > 0, advice: "10 岁后去促织处捕虫、斗虫。" },
  { id: "first-gamble", tier: "bronze", title: "博坊试手", icon: "GamblingHouse", desc: "在博坊留下第一次赌局记录。", score: 45, done: () => logHas(/博坊|赌大小|叫骰|牌九|开盅|赌局/), advice: "15 岁后可去博坊，但要小心钱财。" },
  { id: "first-minigame", tier: "bronze", title: "雅戏入席", icon: "BambooFlute", desc: "完成任一雅戏小游戏。", score: 45, done: () => miniGameRounds() > 0, advice: "去雅戏玩五子棋、投壶或象棋。" },
  { id: "first-caravan", tier: "bronze", title: "走镖上路", icon: "RepairCarriage", desc: "完成第一次押镖或行商路线。", score: 65, done: () => caravanRuns() > 0, advice: "选择镖师行商营生后，挑一条路线出发。" },
  { id: "medicine-visit", tier: "bronze", title: "问诊抓药", icon: "MedicineBag", desc: "去医馆调理或留下医药记录。", score: 40, done: () => logHas(/医馆|问诊|抓药|药|病症|痊愈/), advice: "体魄低时先去医馆，不要硬撑。" },
  { id: "temple-fate", tier: "bronze", title: "香火因缘", icon: "Temple", desc: "在寺庙或德行事件中留下记录。", score: 40, done: () => state.tags.includes("寺庙因缘") || logHas(/寺庙|焚香|香火|佛|庙/), advice: "去寺庙修心，也能添些德行。" },
  { id: "inventory-five", tier: "bronze", title: "行囊渐满", icon: "Backpack", desc: "行囊物品达到 5 件。", score: 45, done: () => inventoryCount() >= 5, advice: "去市集、黑市或活动中收集物品。" },

  { id: "scholar", tier: "silver", title: "金榜有名", icon: "MainBook", desc: "取得至少秀才功名。", score: 120, done: () => state.exam.rank >= 0, advice: "提高学识后继续科举。" },
  { id: "juren", tier: "silver", title: "乡试中举", icon: "Book", desc: "通过乡试成为举人。", score: 145, done: () => state.exam.rank >= 1, advice: "秀才之后继续备考乡试。" },
  { id: "gongshi", tier: "silver", title: "会试登榜", icon: "BookStore", desc: "通过会试成为贡士。", score: 180, done: () => state.exam.rank >= 2, advice: "会试更看学识与备考积累。" },
  { id: "jinshi", tier: "silver", title: "殿试及第", icon: "Official", desc: "通过殿试成为进士。", score: 260, done: () => hasPalaceAppointment(), advice: "一路通过乡试、会试，再参加殿试。" },
  { id: "official-entry", tier: "silver", title: "初入流品", icon: "Official", desc: "官阶达到正九品或以上。", score: 130, done: () => officialRankIndex() >= 2, advice: "殿试后任官，积累政绩即可升迁。" },
  { id: "career-level", tier: "silver", title: "本业精熟", icon: "Craftsman", desc: "任一营生达到 3 级。", score: 120, done: () => maxCareerLevel() >= 3, advice: "在营生页持续处理本业事务。" },
  { id: "career-master", tier: "silver", title: "一门老手", icon: "Craftsman", desc: "任一营生达到 5 级。", score: 170, done: () => maxCareerLevel() >= 5, advice: "不要频繁换业，深耕一门更容易升级。" },
  { id: "network", tier: "silver", title: "亲友满座", icon: "Relationship1", desc: "亲友记录达到 8 人。", score: 90, done: () => relationCount() >= 8, advice: "多去会友、酒楼、探亲，扩展人脉。" },
  { id: "healthy", tier: "silver", title: "身强体健", icon: "MedicineBag", desc: "体魄达到 85。", score: 80, done: () => state.stats.physique >= 85, advice: "去医馆调理，少碰风险活动。" },
  { id: "renown", tier: "silver", title: "一方闻名", icon: "Activity", desc: "名望达到 60。", score: 120, done: () => state.stats.favorability >= 60, advice: "处理官府事务、活动事件或积累善名。" },
  { id: "assets-three", tier: "silver", title: "田宅成基", icon: "House", desc: "拥有 3 处家产。", score: 130, done: () => (state.assets || []).length >= 3, advice: "重复购置田宅铺面，家业会越来越稳。" },
  { id: "assets-five", tier: "silver", title: "广置产业", icon: "Courtyard", desc: "拥有 5 处家产。", score: 165, done: () => (state.assets || []).length >= 5, advice: "钱财充足时继续置产，收益会滚起来。" },
  { id: "wealthy", tier: "silver", title: "富甲一方", icon: "CashBox", desc: "钱财达到一万文或拥有 6 处家产。", score: 190, done: () => state.stats.money >= 10000 || (state.assets || []).length >= 6, advice: "营生、押镖和家产进项都能累积财富。" },
  { id: "children-three", tier: "silver", title: "儿女绕膝", icon: "FamilyIcon", desc: "拥有 3 名在世子女。", score: 130, done: () => livingChildren().length >= 3, advice: "成婚后家中有机会逐年添丁。" },
  { id: "cricket-winner", tier: "silver", title: "促织小魁", icon: "Cricket", desc: "促织累计胜 5 场。", score: 130, done: () => cricketWins() >= 5, advice: "挑选好促织参加斗虫，胜场会记入命册。" },
  { id: "gomoku-winner", tier: "silver", title: "五子连珠", icon: "BambooFlute", desc: "五子棋累计胜 3 场。", score: 120, done: () => state.miniGames?.record?.gomokuWins >= 3, advice: "雅戏里多下五子棋，磨出棋路。" },
  { id: "xiangqi-winner", tier: "silver", title: "楚河破阵", icon: "BambooFlute", desc: "象棋赢下一局。", score: 120, done: () => state.miniGames?.record?.xiangqiWins >= 1, advice: "雅戏中的象棋有中档 AI，先稳住子力。" },
  { id: "touhu-three", tier: "silver", title: "投壶入礼", icon: "BambooFlute", desc: "投壶最佳成绩达到 3 矢。", score: 100, done: () => state.miniGames?.record?.touhuBest >= 3, advice: "角度接近 50、力道接近 62 会更稳。" },

  { id: "triple-exam", tier: "gold", title: "连捷登科", icon: "Official", desc: "正式科举一路无败并通过殿试。", score: 360, done: () => hasPalaceAppointment() && officialExamFailures() === 0 && officialExamPassedCount() >= EXAM_STAGES.length, advice: "每一场都备足再考，尽量不要失手。" },
  { id: "top-official", tier: "gold", title: "位极人臣", icon: "Official", desc: "官阶达到正一品。", score: 420, done: () => officialRankIndex() >= OFFICIAL_RANKS.length - 1, advice: "任官后长期处理公务，政绩足够即可升迁。" },
  { id: "centenarian", tier: "gold", title: "百岁老人", icon: "MedicineBag", desc: "活到 100 岁。", score: 320, done: () => state.age >= 100, advice: "保住体魄，远离高风险事件。" },
  { id: "descendants-full", tier: "gold", title: "子孙满堂", icon: "FamilyIcon", desc: "拥有 6 名在世子女。", score: 260, done: () => livingChildren().length >= 6, advice: "成婚、养家、保住体魄，后半生更容易开枝散叶。" },
  { id: "clan-legacy", tier: "gold", title: "三世家声", icon: "FamilyIcon", desc: "家族传承到第 3 代。", score: 300, done: () => Number(state.lineage?.generation || 1) >= 3, advice: "死亡后选择子女承继，可以延续同一存档。" },
  { id: "great-estate", tier: "gold", title: "广厦连甍", icon: "RoundDragonHouse", desc: "拥有 10 处家产或家产年入达到 600。", score: 300, done: () => (state.assets || []).length >= 10 || annualAssetIncome() >= 600, advice: "多买可重复房产，并逐步扩建。" },
  { id: "gold-hoard", tier: "gold", title: "金满箱奁", icon: "CashBox", desc: "钱财达到三万文。", score: 300, done: () => state.stats.money >= 30000, advice: "把营生、押镖、家产和买卖结合起来。" },
  { id: "all-stats", tier: "gold", title: "六艺俱优", icon: "MainBook", desc: "六项基础属性都达到 90。", score: 300, done: () => allStatsAt(90), advice: "读书、医馆、会友、活动要均衡经营。" },
  { id: "cricket-champion", tier: "gold", title: "促织魁首", icon: "Cricket", desc: "赢得促织大赛冠军。", score: 240, done: () => Number(state.cricketRecord?.champion || 0) > 0, advice: "培养高品相促织，再参加大赛。" },
  { id: "game-master", tier: "gold", title: "雅戏宗师", icon: "BambooFlute", desc: "五子棋 5 胜、象棋 3 胜，且投壶满矢。", score: 280, done: () => state.miniGames?.record?.gomokuWins >= 5 && state.miniGames?.record?.xiangqiWins >= 3 && state.miniGames?.record?.touhuBest >= 5, advice: "把雅戏三项都练到能赢。" },
  { id: "caravan-master", tier: "gold", title: "万里镖路", icon: "RepairCarriage", desc: "押镖行商累计完成 5 趟。", score: 260, done: () => caravanRuns() >= 5, advice: "走熟路线会积累经验，也要控制风险。" },
  { id: "legend-book", tier: "gold", title: "命册厚重", icon: "MainBook", desc: "命册记录达到 80 件。", score: 260, done: () => (state.log || []).length >= 80, advice: "多参与活动、经营亲友和家业，命册自然丰厚。" },
  { id: "poetry-win", tier: "bronze", title: "诗会夺魁", icon: "MainBook", desc: "诗会文斗获胜 3 次。", score: 80, done: () => (state.poetry?.wins || 0) >= 3, advice: "12 岁后去书院或宴会参加诗会文斗。" },
  { id: "travel-codex", tier: "silver", title: "足迹半天下", icon: "RepairCarriage", desc: "旅中奇遇图鉴解锁 6 处。", score: 90, done: () => (state.travelCodex?.unlocked || []).length >= 6, advice: "多乘车马远行，或走押镖、游学之路。" },
  { id: "cricket-season", tier: "bronze", title: "促织赛季魁", icon: "Cricket", desc: "获得任一促织赛季称号。", score: 70, done: () => (state.leisureSeason?.titles || []).some((id) => String(id).startsWith("cricket-")), advice: "去促织处参加大赛，攒本季胜场。" },
  { id: "match-strategy", tier: "silver", title: "良缘有策", icon: "ArrangeMarriage", desc: "通过联姻策略局选定配偶并成婚。", score: 80, done: () => !!state.family?.spouse && !!state.family?.spouseProfile, advice: "16 岁后去媒人处细看家世、彩礼与性情再定亲。" },
  { id: "secret-keep", tier: "gold", title: "隐秘一生", icon: "Letter", desc: "持有秘密至终老且从未败露。", score: 100, done: () => state.dead && (state.secrets || []).some((item) => item && !item.exposed), advice: "黑市或中年后可沾染暗事，败露代价极高。" },
  { id: "prison-survivor", tier: "silver", title: "铁窗三载", icon: "PrisonHeader", desc: "累计度过三年有完整剧情的牢狱生活。", score: 120, done: () => Number(state.prison?.yearsServed || 0) >= 3, advice: "在牢中每年都要处理生存、劳役、人情与申诉。" },
  { id: "prison-appeal", tier: "silver", title: "秋审翻卷", icon: "MainBook", desc: "在狱中申诉或联名作证获得减刑。", score: 140, done: () => (state.prison?.records || []).some((item) => /申诉得准|众证减刑/.test(item.title || "")), advice: "读残卷积累申诉线索，再把握秋审机会。" },
  { id: "culture-first", tier: "bronze", title: "岁时入册", icon: "Temple", desc: "亲历四个传统节日或节气。", score: 60, done: () => (state.culturalCalendar?.seen || []).length >= 4, advice: "每年流转都会遇见一则节日或节气故事。" },
  { id: "culture-four-seasons", tier: "silver", title: "四时有序", icon: "MainBook", desc: "春夏秋冬都留下岁时记录。", score: 130, done: () => Object.keys(CULTURAL_SEASONS).every((season) => Number(state.culturalCalendar?.seasonCounts?.[season] || 0) > 0), advice: "随流年经历完整的春生、夏长、秋收、冬藏。" },
  { id: "culture-terms", tier: "silver", title: "节令通览", icon: "MainBook", desc: "解锁十二个不同节气。", score: 160, done: () => (state.culturalCalendar?.seen || []).filter((id) => id.startsWith("term-")).length >= 12, advice: "在华夏岁时图鉴里记录物候、农事与起居。" },
  { id: "culture-complete", tier: "gold", title: "岁时大成", icon: "Temple", desc: "解锁全部二十四节气与十六个传统节日。", score: 420, done: () => (state.culturalCalendar?.seen || []).length >= CULTURAL_CALENDAR_ITEMS.length, advice: "让一生走遍四十则岁时文化。" },
  { id: "world-witness", tier: "bronze", title: "风云入眼", icon: "Official", desc: "亲历第一幕天下主线。", score: 70, done: () => (state.dynasty?.history || []).some((item) => item.type === "arc"), advice: "十五岁后留意天下风云，灾情、边患与朝局会开启长线。" },
  { id: "world-arc", tier: "silver", title: "一役始终", icon: "Official", desc: "完整走完一条三年天下主线。", score: 180, done: () => (state.dynasty?.completedArcs || []).length >= 1, advice: "天下主线会跨年推进，每一幕选择都会累计评价。" },
  { id: "world-all-arcs", tier: "gold", title: "国史亲历", icon: "MainBook", desc: "完成大河决口、宫闱易主与边关烽火三条主线。", score: 460, done: () => (state.dynasty?.completedArcs || []).length >= Object.keys(WORLD_ARCS).length, advice: "在不同人生中走遍三场改变天下的大事。" },
  { id: "npc-memory", tier: "silver", title: "故人记我", icon: "Relationship1", desc: "一位重要亲友留下四段关于你的长期记忆。", score: 130, done: () => significantNpcRefs().some((person) => (person.memories || []).length >= 4), advice: "探望、照料、送礼与共同经历都会被亲友记住。" },
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
  overlay: state && !state.onboarding?.seen ? "onboarding" : state?.pendingSurprise ? "surprise" : "",
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

function createOfficialState() {
  return {
    rank: 0,
    merit: 0,
    unlocked: false,
    clean: 0,
    corruption: 0,
    network: [],
    retired: false,
    reviewLockUntil: 0,
    reviewLockRank: 0,
    postHistory: [],
    records: { affairs: 0, cases: 0, impeachments: 0, delayed: 0, posthumous: "" },
  };
}

function createFamily(familyName) {
  return {
    father: { name: `${familyName}${sample(DATA.database?.names?.male) || "父"}`, relation: "父亲", gender: "male", alive: true, age: randInt(28, 42), physique: randInt(58, 88), affection: randInt(72, 96) },
    mother: { name: `${sample(DATA.database?.names?.last) || "王"}${sample(DATA.database?.names?.female) || "氏"}`, relation: "母亲", gender: "female", alive: true, age: randInt(25, 39), physique: randInt(55, 86), affection: randInt(72, 96) },
    siblings: makeSiblings(familyName),
    lover: false,
    concubines: [],
    spouseHistory: [],
    concubineCandidate: null,
    intimacyBonus: 0,
    romanceRecords: { intimate: 0, outings: 0, conflicts: 0 },
    children: [],
  };
}

function makeSiblings(familyName, count = randInt(0, 2)) {
  return Array.from({ length: count }, () => {
    const gender = Math.random() > 0.5 ? "male" : "female";
    const age = randInt(2, 12);
    const name = `${familyName}${sample(gender === "female" ? DATA.database?.names?.female : DATA.database?.names?.male) || "无名"}`;
    return {
      id: `sibling-${name}`,
      name,
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
    careerHistory: [],
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
    official: createOfficialState(),
    lineage: { generation: 1, familyName: draft.family, ancestors: [] },
    life: { milestones: [], goals: [] },
    study: { prep: 0, lastYear: -1 },
    gamble: createGambleRound(50),
    miniGames: createMiniGamesState(),
    courtesanContest: null,
    courtesanVisit: null,
    brothelRecords: { visits: 0, favorites: [] },
    market: { year: -1, factor: 1 },
    travelSystem: createTravelSystem(),
    pendingTravel: null,
    caravanMemory: {},
    pendingCaravan: null,
    family: createFamily(draft.family),
    familyStories: { active: null, completed: [], lastTriggerYear: -1 },
    templeFortune: { active: null, history: [], lastDrawYear: -1 },
    underworld: createUnderworldState(),
    mystery: { active: null, completed: [] },
    jianghu: createJianghuState(),
    secretLines: createSecretLinesState(),
    exam: { rank: -1, attempts: 0, history: [], current: null, lastYear: -1 },
    recentEventKeys: [],
    pendingActivity: null,
    eventResult: null,
    pendingSurprise: null,
    pendingAchievement: null,
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
  next.careerHistory = Array.isArray(next.careerHistory) ? next.careerHistory.slice(-20) : [];
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
  next.official = normalizeOfficial(next.official);
  next.lineage = normalizeLineage(next.lineage, next.name.slice(0, 1));
  next.life = normalizeLife(next.life, next.age);
  next.study = normalizeStudy(next.study);
  next.gamble = normalizeGamble(next.gamble);
  next.miniGames = normalizeMiniGames(next.miniGames);
  next.courtesanContest = normalizeCourtesanContest(next.courtesanContest);
  next.courtesanVisit = normalizeCourtesanVisit(next.courtesanVisit);
  next.brothelRecords = {
    visits: Math.max(0, Math.round(Number(next.brothelRecords?.visits) || 0)),
    favorites: Array.isArray(next.brothelRecords?.favorites) ? next.brothelRecords.favorites.slice(0, 8) : [],
  };
  next.careerProgress = next.careerProgress && typeof next.careerProgress === "object" ? next.careerProgress : {};
  for (const [name, source] of Object.entries(next.careerProgress)) {
    const item = source && typeof source === "object" ? source : {};
    next.careerProgress[name] = {
      ...item,
      exp: Math.max(0, Number(item.exp) || 0),
      level: Math.max(1, Math.round(Number(item.level) || 1)),
      records: {
        cases: Math.max(0, Math.round(Number(item.records?.cases) || 0)),
        successes: Math.max(0, Math.round(Number(item.records?.successes) || 0)),
      },
    };
  }
  next.market = next.market && typeof next.market === "object" ? next.market : {};
  next.market.year = Number.isFinite(Number(next.market.year)) ? Number(next.market.year) : -1;
  next.market.factor = Number.isFinite(Number(next.market.factor)) ? Number(next.market.factor) : 1;
  next.poetry = normalizePoetry(next.poetry);
  next.poetryRound = normalizePoetryRound(next.poetryRound);
  next.travelCodex = normalizeTravelCodex(next.travelCodex);
  next.leisureSeason = normalizeLeisureSeason(next.leisureSeason, next.age);
  next.secrets = normalizeSecrets(next.secrets);
  next.matchPool = Array.isArray(next.matchPool) ? next.matchPool.map(normalizeMatchCandidate).filter(Boolean).slice(0, 3) : [];
  next.travelSystem = normalizeTravelSystem(next.travelSystem);
  next.pendingTravel = normalizeTravelRun(next.pendingTravel);
  next.caravanMemory = normalizeCaravanMemory(next.caravanMemory);
  next.pendingCaravan = normalizeCaravanRun(next.pendingCaravan, next.age);
  next.family = normalizeFamily(next.family, next.name.slice(0, 1));
  next.familyStories = normalizeFamilyStories(next.familyStories);
  next.templeFortune = normalizeTempleFortune(next.templeFortune);
  next.underworld = normalizeUnderworld(next.underworld);
  next.mystery = normalizeMysteryState(next.mystery);
  next.jianghu = normalizeJianghuState(next.jianghu);
  next.secretLines = normalizeSecretLinesState(next.secretLines, next.age);
  next.exam = normalizeExam(next.exam);
  next.pendingActivity = next.pendingActivity || null;
  next.eventResult = next.eventResult || null;
  next.pendingSurprise = next.pendingSurprise || null;
  next.pendingAchievement = next.pendingAchievement || null;
  next.inventoryTab = INVENTORY_CATEGORIES.some(([id]) => id === next.inventoryTab) ? next.inventoryTab : "all";
  next.onboarding = normalizeOnboarding(next.onboarding);
  next.lastDeltas = Array.isArray(next.lastDeltas) ? next.lastDeltas : [];
  next.recentEventKeys = Array.isArray(next.recentEventKeys)
    ? next.recentEventKeys.map(String).filter(Boolean).slice(0, 24)
    : [];
  next.prisonYears = Math.max(0, Math.round(Number(next.prisonYears) || 0));
  next.prison = normalizePrisonState(next.prison, next.prisonYears, next.age, next.gender);
  next.culturalCalendar = normalizeCulturalCalendar(next.culturalCalendar);
  next.dynasty = normalizeDynastyState(next.dynasty);
  next.pendingAnnualEvent = next.pendingAnnualEvent && typeof next.pendingAnnualEvent === "object" ? next.pendingAnnualEvent : null;
  // 旧版若恰好存档在两段年度事件之间，读取后继续尚未结算的后续事件。
  if (!next.currentEvent && !next.eventResult && next.pendingAnnualEvent) {
    next.currentEvent = next.pendingAnnualEvent;
    next.pendingAnnualEvent = null;
  }
  next.dead = !!next.dead;
  next.deathReason ||= "";
  if (next.dead) {
    next.currentEvent = null;
    next.pendingAnnualEvent = null;
    next.pendingCaravan = null;
    next.pendingTravel = null;
  }
  return next;
}

function createPrisonState() {
  return {
    active: false,
    entryAge: -1,
    yearsServed: 0,
    totalYears: 0,
    reputation: 0,
    guardFavor: 35,
    inmateFavor: 40,
    laborSkill: 0,
    appeal: 0,
    letters: 0,
    lastEventId: "",
    recentEventIds: [],
    cellmate: null,
    guard: null,
    records: [],
    releases: 0,
    lastReason: "",
  };
}

function normalizePrisonState(source, prisonYears = 0, age = 1, gender = "male") {
  const base = source && typeof source === "object" ? source : {};
  const defaults = createPrisonState();
  const makePrisonPerson = (person, gender, role) => {
    const item = person && typeof person === "object" ? person : {};
    return {
      name: String(item.name || makePersonName(gender)),
      gender,
      role,
      age: clampNumber(item.age, 18, 72, randInt(24, 58)),
    };
  };
  return {
    ...defaults,
    ...base,
    active: prisonYears > 0 || !!base.active,
    entryAge: Number.isFinite(Number(base.entryAge)) ? Number(base.entryAge) : prisonYears > 0 ? age : -1,
    yearsServed: Math.max(0, Math.round(Number(base.yearsServed) || 0)),
    totalYears: Math.max(prisonYears, Math.round(Number(base.totalYears) || 0)),
    reputation: clampNumber(base.reputation, -100, 100, 0),
    guardFavor: clampNumber(base.guardFavor, 0, 100, 35),
    inmateFavor: clampNumber(base.inmateFavor, 0, 100, 40),
    laborSkill: clampNumber(base.laborSkill, 0, 100, 0),
    appeal: clampNumber(base.appeal, 0, 100, 0),
    letters: Math.max(0, Math.round(Number(base.letters) || 0)),
    lastEventId: String(base.lastEventId || ""),
    recentEventIds: Array.isArray(base.recentEventIds) ? base.recentEventIds.map(String).filter(Boolean).slice(0, 6) : [],
    cellmate: makePrisonPerson(base.cellmate, gender === "female" ? "female" : "male", "同监狱友"),
    guard: makePrisonPerson(base.guard, "male", "当值狱卒"),
    records: Array.isArray(base.records) ? base.records.filter((item) => item && typeof item === "object").slice(0, 24) : [],
    releases: Math.max(0, Math.round(Number(base.releases) || 0)),
    lastReason: String(base.lastReason || ""),
  };
}

function createCulturalCalendar() {
  return {
    seen: [],
    records: {},
    total: 0,
    festivalCount: 0,
    termCount: 0,
    lastId: "",
    recentIds: [],
    seasonCounts: { spring: 0, summer: 0, autumn: 0, winter: 0 },
    familyChoices: 0,
    publicChoices: 0,
    reflectionChoices: 0,
  };
}

function normalizeCulturalCalendar(source) {
  const base = source && typeof source === "object" ? source : {};
  const defaults = createCulturalCalendar();
  const seen = Array.isArray(base.seen) ? [...new Set(base.seen.map(String))].filter((id) => CULTURAL_CALENDAR_ITEMS.some((item) => item.id === id)) : [];
  return {
    ...defaults,
    ...base,
    seen,
    records: base.records && typeof base.records === "object" ? base.records : {},
    total: Math.max(0, Math.round(Number(base.total) || 0)),
    festivalCount: Math.max(0, Math.round(Number(base.festivalCount) || 0)),
    termCount: Math.max(0, Math.round(Number(base.termCount) || 0)),
    lastId: String(base.lastId || ""),
    recentIds: Array.isArray(base.recentIds) ? base.recentIds.map(String).filter(Boolean).slice(0, 10) : [],
    seasonCounts: Object.fromEntries(Object.keys(CULTURAL_SEASONS).map((season) => [season, Math.max(0, Math.round(Number(base.seasonCounts?.[season]) || 0))])),
    familyChoices: Math.max(0, Math.round(Number(base.familyChoices) || 0)),
    publicChoices: Math.max(0, Math.round(Number(base.publicChoices) || 0)),
    reflectionChoices: Math.max(0, Math.round(Number(base.reflectionChoices) || 0)),
  };
}

function createDynastyState() {
  const temperament = sample(RULER_TEMPERAMENTS) || RULER_TEMPERAMENTS[0];
  return {
    eraName: sample(DYNASTY_ERA_NAMES) || "景和",
    reignYear: 1,
    rulerName: makePersonName("male"),
    rulerAge: randInt(24, 52),
    temperamentId: temperament.id,
    prosperity: 58,
    stability: 62,
    treasury: 55,
    borderThreat: 24,
    corruption: 30,
    local: { grainPrice: 100, security: 62, disaster: 16, epidemic: 10, sentiment: 58 },
    factions: { reformers: 48, conservatives: 55, military: 46, court: 42 },
    headline: "四境承平，州县照常开市劝农。",
    history: [],
    activeArc: null,
    completedArcs: [],
    lastArcYear: -20,
    lastIncidentId: "",
    successions: 0,
  };
}

function normalizeDynastyState(source) {
  const defaults = createDynastyState();
  const base = source && typeof source === "object" ? source : {};
  const temperamentId = RULER_TEMPERAMENTS.some((item) => item.id === base.temperamentId) ? base.temperamentId : defaults.temperamentId;
  const local = base.local && typeof base.local === "object" ? base.local : {};
  const factions = base.factions && typeof base.factions === "object" ? base.factions : {};
  const active = base.activeArc && WORLD_ARCS[base.activeArc.id] ? base.activeArc : null;
  return {
    ...defaults,
    ...base,
    eraName: String(base.eraName || defaults.eraName),
    reignYear: Math.max(1, Math.round(Number(base.reignYear) || 1)),
    rulerName: String(base.rulerName || defaults.rulerName),
    rulerAge: clampNumber(base.rulerAge, 16, 99, defaults.rulerAge),
    temperamentId,
    prosperity: clampNumber(base.prosperity, 0, 100, defaults.prosperity),
    stability: clampNumber(base.stability, 0, 100, defaults.stability),
    treasury: clampNumber(base.treasury, 0, 100, defaults.treasury),
    borderThreat: clampNumber(base.borderThreat, 0, 100, defaults.borderThreat),
    corruption: clampNumber(base.corruption, 0, 100, defaults.corruption),
    local: {
      grainPrice: clampNumber(local.grainPrice, 45, 220, defaults.local.grainPrice),
      security: clampNumber(local.security, 0, 100, defaults.local.security),
      disaster: clampNumber(local.disaster, 0, 100, defaults.local.disaster),
      epidemic: clampNumber(local.epidemic, 0, 100, defaults.local.epidemic),
      sentiment: clampNumber(local.sentiment, 0, 100, defaults.local.sentiment),
    },
    factions: Object.fromEntries(Object.keys(WORLD_FACTIONS).map((key) => [key, clampNumber(factions[key], 0, 100, defaults.factions[key])])),
    headline: String(base.headline || defaults.headline),
    history: Array.isArray(base.history) ? base.history.filter((item) => item && typeof item === "object").slice(0, 30) : [],
    activeArc: active ? {
      id: active.id,
      stage: clampNumber(active.stage, 0, WORLD_ARCS[active.id].stages.length - 1, 0),
      score: Number.isFinite(Number(active.score)) ? Number(active.score) : 0,
      dueYear: Math.max(0, Math.round(Number(active.dueYear) || 0)),
      startedYear: Math.max(0, Math.round(Number(active.startedYear) || 0)),
      choices: Array.isArray(active.choices) ? active.choices.map(String).slice(0, 6) : [],
    } : null,
    completedArcs: Array.isArray(base.completedArcs) ? [...new Set(base.completedArcs.map(String).filter((id) => WORLD_ARCS[id]))].slice(-12) : [],
    lastArcYear: Number.isFinite(Number(base.lastArcYear)) ? Number(base.lastArcYear) : -20,
    lastIncidentId: String(base.lastIncidentId || ""),
    successions: Math.max(0, Math.round(Number(base.successions) || 0)),
  };
}

function carryDynastyAcrossInheritance(source, oldYear, nextYear) {
  const carried = normalizeDynastyState(JSON.parse(JSON.stringify(source || {})));
  if (carried.activeArc) {
    const wait = Math.max(0, Number(carried.activeArc.dueYear || oldYear) - Number(oldYear || 0));
    const elapsed = Math.max(0, Number(oldYear || 0) - Number(carried.activeArc.startedYear || oldYear));
    carried.activeArc.dueYear = Number(nextYear || 0) + wait;
    carried.activeArc.startedYear = Math.max(0, Number(nextYear || 0) - elapsed);
  }
  carried.lastArcYear = Number(nextYear || 0) - Math.max(0, Number(oldYear || 0) - Number(carried.lastArcYear || oldYear));
  return carried;
}

function dynastyTemperament() {
  return RULER_TEMPERAMENTS.find((item) => item.id === state.dynasty?.temperamentId) || RULER_TEMPERAMENTS[0];
}

function dynastyPhase(world = state.dynasty) {
  if (!world) return { id: "peace", name: "承平", note: "天下大体安稳" };
  const strength = (world.prosperity + world.stability + world.treasury + world.local.security + world.local.sentiment) / 5;
  const danger = (world.borderThreat + world.corruption + world.local.disaster + world.local.epidemic) / 4;
  if (strength >= 72 && danger <= 32) return { id: "golden", name: "盛世", note: "仓廪渐实，四境少警" };
  if (danger >= 68 || world.stability <= 28) return { id: "chaos", name: "乱世", note: "内外交迫，人心思变" };
  if (strength <= 38 || danger >= 52) return { id: "decline", name: "衰世", note: "民力困乏，朝局多艰" };
  return { id: "peace", name: "承平", note: "治乱相半，尚可经营" };
}

function worldValue(path) {
  return String(path).split(".").reduce((value, key) => value?.[key], state.dynasty);
}

function changeWorldValue(path, amount, deltas = []) {
  const parts = String(path).split(".");
  let target = state.dynasty;
  for (const key of parts.slice(0, -1)) {
    target[key] ||= {};
    target = target[key];
  }
  const key = parts.at(-1);
  const before = Number(target[key] || 0);
  const limits = path === "local.grainPrice" ? [45, 220] : [0, 100];
  target[key] = clamp(before + Number(amount || 0), ...limits);
  const actual = Math.round(target[key] - before);
  if (actual && deltas) {
    const labels = { prosperity: "国力", stability: "安定", treasury: "国库", borderThreat: "边患", corruption: "贪墨", "local.grainPrice": "粮价", "local.security": "治安", "local.disaster": "灾情", "local.epidemic": "疫病", "local.sentiment": "民心" };
    deltas.push({ label: labels[path] || WORLD_FACTIONS[key]?.name || path, value: actual, negative: ["borderThreat", "corruption", "local.grainPrice", "local.disaster", "local.epidemic"].includes(path) ? actual > 0 : actual < 0 });
  }
}

function applyWorldChanges(changes = {}, deltas = []) {
  for (const [path, value] of Object.entries(changes || {})) {
    if (path === "factions" && value && typeof value === "object") {
      for (const [faction, factionValue] of Object.entries(value)) changeWorldValue(`factions.${faction}`, rangeValue(factionValue), deltas);
    } else changeWorldValue(path, rangeValue(value), deltas);
  }
}

function createTravelSystem() {
  return { carriageLevel: 1, condition: 100, selectedDestination: "yunzhou", companionId: "alone", supplyId: "steady", memories: {}, stamps: [], totalTrips: 0 };
}

function normalizeTravelSystem(source) {
  const base = source && typeof source === "object" ? source : {};
  const memories = base.memories && typeof base.memories === "object" ? base.memories : {};
  return {
    carriageLevel: clamp(Math.round(Number(base.carriageLevel) || 1), 1, TRAVEL_CARRIAGES.length),
    condition: clamp(Number(base.condition ?? 100), 0, 100),
    selectedDestination: TRAVEL_DESTINATIONS.some((item) => item.id === base.selectedDestination) ? base.selectedDestination : "yunzhou",
    companionId: String(base.companionId || "alone"),
    supplyId: TRAVEL_SUPPLIES.some((item) => item.id === base.supplyId) ? base.supplyId : "steady",
    memories: Object.fromEntries(TRAVEL_DESTINATIONS.map((destination) => {
      const memory = memories[destination.id] && typeof memories[destination.id] === "object" ? memories[destination.id] : {};
      return [destination.id, { trips: Math.max(0, Math.round(Number(memory.trips) || 0)), bestQuality: clamp(Number(memory.bestQuality || 0)), lastCompanion: String(memory.lastCompanion || ""), lastActivity: String(memory.lastActivity || "") }];
    })),
    stamps: Array.isArray(base.stamps) ? [...new Set(base.stamps.map(String))].slice(0, 20) : [],
    totalTrips: Math.max(0, Math.round(Number(base.totalTrips) || 0)),
  };
}

function normalizeTravelRun(run) {
  if (!run || typeof run !== "object") return null;
  const destination = TRAVEL_DESTINATIONS.find((item) => item.id === run.destinationId);
  if (!destination) return null;
  const events = Array.isArray(run.events) ? run.events.filter((id) => TRAVEL_ROUTE_EVENTS.some((item) => item.id === id)) : [];
  return {
    id: run.id || `travel-${Date.now()}`,
    destinationId: destination.id,
    origin: String(run.origin || state?.location || "清平县"),
    index: clamp(Math.round(Number(run.index) || 0), 0, events.length),
    events,
    companionId: String(run.companionId || "alone"),
    companionName: String(run.companionName || "独行"),
    supplyId: TRAVEL_SUPPLIES.some((item) => item.id === run.supplyId) ? run.supplyId : "steady",
    quality: clamp(Number(run.quality ?? 55)),
    spent: Math.max(0, Math.round(Number(run.spent) || 0)),
    history: Array.isArray(run.history) ? run.history.slice(-10) : [],
  };
}

function normalizeOnboarding(onboarding) {
  const source = onboarding && typeof onboarding === "object" ? onboarding : {};
  const version = Math.max(0, Math.round(Number(source.version) || 0));
  return {
    version,
    seen: !!source.seen && version >= ONBOARDING_VERSION,
  };
}

function normalizeFamilyStories(stories) {
  const source = stories && typeof stories === "object" ? stories : {};
  const active = source.active && typeof source.active === "object" ? source.active : null;
  return {
    active: active
      ? {
          type: ["parentIllness", "siblingDivision", "childEducation"].includes(active.type) ? active.type : "",
          targetId: String(active.targetId || ""),
          stage: active.stage === "followup" ? "followup" : "intro",
          choice: String(active.choice || ""),
          score: Number.isFinite(Number(active.score)) ? Number(active.score) : 0,
          dueYear: Math.max(0, Math.round(Number(active.dueYear) || 0)),
          key: String(active.key || ""),
        }
      : null,
    completed: Array.isArray(source.completed) ? [...new Set(source.completed.map(String).filter(Boolean))].slice(-30) : [],
    lastTriggerYear: Number.isFinite(Number(source.lastTriggerYear)) ? Number(source.lastTriggerYear) : -1,
  };
}

function normalizeTempleFortune(fortune) {
  const source = fortune && typeof fortune === "object" ? fortune : {};
  const active = source.active && typeof source.active === "object" ? source.active : null;
  return {
    active: active ? {
      id: TEMPLE_FORTUNES.some((item) => item.id === active.id) ? active.id : "warning",
      drawnYear: Math.max(0, Math.round(Number(active.drawnYear) || 0)),
      dueYear: Math.max(0, Math.round(Number(active.dueYear) || 0)),
    } : null,
    history: Array.isArray(source.history) ? source.history.slice(-12) : [],
    lastDrawYear: Number.isFinite(Number(source.lastDrawYear)) ? Number(source.lastDrawYear) : -1,
  };
}

function createUnderworldState() {
  return { heat: 0, broker: null, activeCheat: null, extortion: null, examinerOffer: null, records: { attempts: 0, successes: 0, exposed: 0, soldQuestions: 0 } };
}

function normalizeUnderworld(source) {
  const base = source && typeof source === "object" ? source : {};
  return {
    heat: clamp(Number(base.heat || 0)),
    broker: base.broker && typeof base.broker === "object" ? { name: String(base.broker.name || "铁算盘"), trust: clamp(Number(base.broker.trust ?? 45)), lastYear: Number(base.broker.lastYear ?? -1) } : null,
    activeCheat: base.activeCheat && EXAM_CHEAT_METHODS.some((item) => item.id === base.activeCheat.id) ? { id: base.activeCheat.id, genuine: base.activeCheat.genuine !== false, boughtYear: Number(base.activeCheat.boughtYear ?? -1) } : null,
    extortion: base.extortion && typeof base.extortion === "object" ? { amount: Math.max(0, Number(base.extortion.amount) || 0), dueYear: Math.max(0, Number(base.extortion.dueYear) || 0), name: String(base.extortion.name || "书吏") } : null,
    examinerOffer: base.examinerOffer && typeof base.examinerOffer === "object" ? base.examinerOffer : null,
    records: {
      attempts: Math.max(0, Number(base.records?.attempts) || 0),
      successes: Math.max(0, Number(base.records?.successes) || 0),
      exposed: Math.max(0, Number(base.records?.exposed) || 0),
      soldQuestions: Math.max(0, Number(base.records?.soldQuestions) || 0),
    },
  };
}

function normalizeMysteryState(source) {
  const base = source && typeof source === "object" ? source : {};
  const active = base.active && MYSTERY_CASES.some((item) => item.id === base.active.caseId) ? base.active : null;
  return {
    active: active ? { caseId: active.caseId, round: Math.max(0, Number(active.round) || 0), clues: Array.isArray(active.clues) ? active.clues.slice(0, 6) : [], actionsUsed: Array.isArray(active.actionsUsed) ? [...new Set(active.actionsUsed)] : [], role: ["official", "civilian"].includes(active.role) ? active.role : "legacy" } : null,
    completed: Array.isArray(base.completed) ? base.completed.slice(-20) : [],
  };
}

function createJianghuState() {
  return { mentor: null, skills: [], heat: 0, enabledQian: false, prophecy: null, pursuit: null, records: { cons: 0, caught: 0, prophecies: 0, trueProphecies: 0 } };
}

function normalizeJianghuState(source) {
  const base = source && typeof source === "object" ? source : {};
  return {
    mentor: base.mentor && typeof base.mentor === "object" ? { name: String(base.mentor.name || "无影手"), affection: clamp(Number(base.mentor.affection ?? 55)) } : null,
    skills: Array.isArray(base.skills) ? [...new Set(base.skills.filter((id) => JIANGHU_SKILLS.some((item) => item.id === id)))] : [],
    heat: clamp(Number(base.heat || 0)),
    enabledQian: !!base.enabledQian,
    prophecy: base.prophecy && typeof base.prophecy === "object" ? { type: String(base.prophecy.type || "blood"), truthful: base.prophecy.truthful !== false, dueYear: Math.max(0, Number(base.prophecy.dueYear) || 0), text: String(base.prophecy.text || "") } : null,
    pursuit: base.pursuit && typeof base.pursuit === "object" ? { dueYear: Math.max(0, Number(base.pursuit.dueYear) || 0), reason: String(base.pursuit.reason || "旧账追来") } : null,
    records: { cons: Math.max(0, Number(base.records?.cons) || 0), caught: Math.max(0, Number(base.records?.caught) || 0), prophecies: Math.max(0, Number(base.records?.prophecies) || 0), trueProphecies: Math.max(0, Number(base.records?.trueProphecies) || 0) },
  };
}

function createSecretLinesState() {
  return { introduced: false, seenHub: false, lastVisitedYear: -1 };
}

function normalizeSecretLinesState(source, age = 0) {
  const base = source && typeof source === "object" ? source : {};
  return {
    introduced: !!base.introduced,
    seenHub: !!base.seenHub,
    lastVisitedYear: Number.isFinite(Number(base.lastVisitedYear)) ? Number(base.lastVisitedYear) : -1,
    legacyEligible: !!base.legacyEligible || (Number(age) >= 15 && source == null),
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
  const concubines = Array.isArray(source.concubines) ? source.concubines : [];
  const spouseRelation = source.spouseRelation || "配偶";
  const romanceRecords = source.romanceRecords && typeof source.romanceRecords === "object" ? source.romanceRecords : {};
  const normalizedSpouse = source.spouse ? normalizePartner({ name: typeof source.spouse === "string" ? source.spouse : source.spouse?.name, relation: spouseRelation, gender: source.spouseGender, alive: true, affection: source.spouseAffection ?? 78, ...source.spouseMeta }, familyName, spouseRelation) : null;
  const spouseHistory = Array.isArray(source.spouseHistory) ? source.spouseHistory.map((item, index) => normalizePartner(item, familyName, item?.relation || "故配", `former-spouse-${index}`)) : [];
  if (normalizedSpouse?.alive === false && !spouseHistory.some((item) => item.name === normalizedSpouse.name)) spouseHistory.push({ ...normalizedSpouse, relation: "故配" });
  const currentSpouse = normalizedSpouse?.alive === false ? null : normalizedSpouse;
  return {
    father: normalizeParent({ relation: "父亲", gender: "male", alive: true, affection: randInt(68, 96), ...father }, "father"),
    mother: normalizeParent({ relation: "母亲", gender: "female", alive: true, affection: randInt(68, 96), ...mother }, "mother"),
    siblings: siblings.map((item) => normalizeRelative({ relation: item.gender === "female" ? "姐姐" : "哥哥", alive: true, affection: randInt(42, 88), ...item }, familyName, "sibling")),
    lover: source.lover || false,
    loverMeta: source.lover ? normalizeRelative({ name: typeof source.lover === "string" ? source.lover : source.lover?.name, relation: "相看之人", gender: source.loverGender, alive: true, affection: 64, ...source.loverMeta }, familyName, "partner") : null,
    loverProfile: source.lover ? normalizeMatchCandidate(source.loverProfile) : null,
    spouse: currentSpouse?.name || null,
    spouseMeta: currentSpouse,
    spouseProfile: currentSpouse ? normalizeMatchCandidate(source.spouseProfile) : null,
    spouseAffection: clamp(Number(source.spouseAffection ?? 78)),
    spouseHistory: spouseHistory.slice(-6),
    concubines: concubines.map((item, index) => normalizePartner(typeof item === "string" ? { name: item } : item, familyName, "妾室", `concubine-${index}`)),
    concubineCandidate: source.concubineCandidate ? normalizePartner(source.concubineCandidate, familyName, "待纳侧室", "concubine-candidate") : null,
    intimacyBonus: clamp(Number(source.intimacyBonus || 0), 0, 0.45),
    romanceRecords: {
      intimate: Math.max(0, Math.round(Number(romanceRecords.intimate) || 0)),
      outings: Math.max(0, Math.round(Number(romanceRecords.outings) || 0)),
      conflicts: Math.max(0, Math.round(Number(romanceRecords.conflicts) || 0)),
    },
    children: children.map((item) => normalizeChild(item, familyName)),
  };
}

function normalizeNpcAgency(source, relation = "亲友", age = 18) {
  const base = source && typeof source === "object" ? source : {};
  const occupationFallback = age < 15 ? "尚未谋业" : /父亲|母亲/.test(relation) ? sample(["料理家业", "务农", "经营小铺"]) : sample(NPC_OCCUPATIONS);
  return {
    ambition: String(base.ambition || sample(NPC_AMBITIONS) || "求安稳"),
    disposition: String(base.disposition || sample(NPC_DISPOSITIONS) || "重情"),
    occupation: String(base.occupation || occupationFallback || "料理家业"),
    wealth: clampNumber(base.wealth, 0, 100, randInt(25, 65)),
    influence: clampNumber(base.influence, 0, 100, randInt(12, 48)),
    memories: Array.isArray(base.memories) ? base.memories.filter((item) => item && typeof item === "object").map((item) => ({ year: Number(item.year || 0), type: String(item.type || "往事"), text: String(item.text || ""), impact: Number(item.impact || 0) })).slice(0, 8) : [],
    lastActionYear: Number.isFinite(Number(base.lastActionYear)) ? Number(base.lastActionYear) : -1,
    lastAction: String(base.lastAction || ""),
    marriedTo: String(base.marriedTo || ""),
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
  const agency = normalizeNpcAgency(source, relation, age);
  return {
    ...source,
    ...agency,
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
  const relation = isFather ? "父亲" : "母亲";
  return {
    ...source,
    ...normalizeNpcAgency(source, relation, age),
    relation,
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
    spouse: null,
    grandchildren: [],
  };
}

function normalizeChild(child, familyName) {
  const base = child && typeof child === "object" ? child : makeChild(familyName);
  const gender = base.gender === "female" ? "female" : "male";
  const physique = clamp(Number(base.physique ?? randInt(42, 86)));
  const childId = base.id || `child-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const spouseRelation = gender === "female" ? "女婿" : "儿媳";
  const spouse = base.spouse ? normalizeRelative({ ...base.spouse, relation: spouseRelation, gender: gender === "female" ? "male" : "female" }, familyName, "partner") : null;
  const grandchildren = Array.isArray(base.grandchildren) ? base.grandchildren : [];
  return {
    ...normalizeNpcAgency(base, base.relation || (gender === "female" ? "女儿" : "儿子"), Math.max(0, Math.round(Number(base.age) || 0))),
    id: childId,
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
    educationPath: ["academy", "craft", "home"].includes(base.educationPath) ? base.educationPath : "",
    educationOutcome: String(base.educationOutcome || ""),
    otherParent: String(base.otherParent || ""),
    spouse,
    marriageYear: Number.isFinite(Number(base.marriageYear)) ? Number(base.marriageYear) : -1,
    grandchildren: grandchildren.map((item) => normalizeGrandchild(item, familyName, childId)),
  };
}

function makeGrandchild(parent, age = 0) {
  const gender = Math.random() > 0.5 ? "male" : "female";
  const familyName = parent?.gender === "male" ? parent.name.slice(0, 1) : parent?.spouse?.name?.slice(0, 1) || state.name.slice(0, 1);
  return normalizeGrandchild({
    id: `grandchild-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: `${familyName}${sample(gender === "female" ? DATA.database?.names?.female : DATA.database?.names?.male) || "承安"}`,
    gender,
    age,
    otherParent: parent?.spouse?.name || "",
  }, familyName, parent?.id || "");
}

function normalizeGrandchild(grandchild, familyName, parentId) {
  const base = grandchild && typeof grandchild === "object" ? grandchild : {};
  const gender = base.gender === "female" ? "female" : "male";
  const physique = clamp(Number(base.physique ?? randInt(42, 86)));
  return {
    ...normalizeNpcAgency(base, gender === "female" ? "孙女" : "孙子", Math.max(0, Math.round(Number(base.age) || 0))),
    id: base.id || `grandchild-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: base.name || `${familyName}${sample(gender === "female" ? DATA.database?.names?.female : DATA.database?.names?.male) || "承安"}`,
    relation: gender === "female" ? "孙女" : "孙子",
    gender,
    age: Math.max(0, Math.round(Number(base.age) || 0)),
    physique,
    alive: base.alive !== false && physique > 0,
    affection: clamp(Number(base.affection ?? randInt(58, 88))),
    aptitude: clamp(Number(base.aptitude ?? randInt(35, 88))),
    study: clamp(Number(base.study ?? randInt(0, 20))),
    virtue: clamp(Number(base.virtue ?? randInt(30, 80))),
    trait: base.trait || sample(CHILD_TRAITS) || "聪慧",
    parentId: String(base.parentId || parentId || ""),
    otherParent: String(base.otherParent || ""),
  };
}

function normalizeFriend(friend) {
  if (typeof friend === "string") {
    return normalizeFriend({ id: `friend-${friend}`, name: friend, relation: "友人", gender: "unknown", age: randInt(12, 60), physique: randInt(35, 88), alive: true, affection: randInt(42, 78), lastMet: -1 });
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

function normalizeOfficial(source) {
  const base = createOfficialState();
  const official = source && typeof source === "object" ? { ...base, ...source } : base;
  official.rank = clamp(Math.round(Number(official.rank) || 0), 0, OFFICIAL_RANKS.length - 1);
  official.merit = Math.max(0, Number(official.merit) || 0);
  official.unlocked = !!official.unlocked;
  official.clean = clamp(Number(official.clean) || 0, -100, 100);
  official.corruption = clamp(Number(official.corruption) || 0, 0, 100);
  official.retired = !!official.retired;
  official.reviewLockUntil = Math.max(0, Number(official.reviewLockUntil) || 0);
  official.reviewLockRank = clamp(Math.round(Number(official.reviewLockRank) || 0), 0, OFFICIAL_RANKS.length - 1);
  official.postHistory = Array.isArray(official.postHistory)
    ? official.postHistory.map((item) => ({ rank: clamp(Math.round(Number(item?.rank) || 0), 0, OFFICIAL_RANKS.length - 1), year: Math.max(0, Math.round(Number(item?.year) || 0)), reason: String(item?.reason || "任命") })).slice(-20)
    : [];
  official.network = Array.isArray(official.network) ? official.network.map(normalizeOfficialContact).filter(Boolean).slice(0, 8) : [];
  official.records = official.records && typeof official.records === "object" ? official.records : {};
  official.records.affairs = Math.max(0, Number(official.records.affairs) || 0);
  official.records.cases = Math.max(0, Number(official.records.cases) || 0);
  official.records.impeachments = Math.max(0, Number(official.records.impeachments) || 0);
  official.records.delayed = Math.max(0, Number(official.records.delayed) || 0);
  official.records.posthumous = official.records.posthumous || "";
  return official;
}

function normalizeOfficialContact(contact) {
  if (!contact || typeof contact !== "object") return null;
  const seed = OFFICIAL_NETWORK_SEEDS.find((item) => item.name === contact.name) || {};
  const name = contact.name || seed.name || makePersonName("male");
  return {
    id: contact.id || `official-${name}`,
    name,
    relation: contact.relation || seed.relation || "同僚",
    faction: contact.faction || seed.faction || "中立",
    rank: clamp(Math.round(Number(contact.rank ?? seed.rank ?? 6)), 0, OFFICIAL_RANKS.length - 1),
    affection: clamp(Number(contact.affection ?? seed.affection ?? 45), -100, 100),
  };
}

function ensureOfficialNetwork() {
  state.official ||= createOfficialState();
  state.official.network = Array.isArray(state.official.network) ? state.official.network : [];
  const desired = Math.min(5, 2 + Math.floor(officialRankIndex() / 5));
  const existing = new Set(state.official.network.map((item) => item.name));
  const seeds = OFFICIAL_NETWORK_SEEDS.filter((seed) => !existing.has(seed.name));
  while (state.official.network.length < desired && seeds.length) {
    const seed = seeds.splice(randInt(0, seeds.length - 1), 1)[0];
    state.official.network.push(normalizeOfficialContact({ ...seed, affection: seed.affection + randInt(-8, 8) }));
  }
  state.official.network = state.official.network.map(normalizeOfficialContact).filter(Boolean).slice(0, 8);
  return state.official.network;
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

function createCourtesanVisit() {
  return normalizeCourtesanVisit({
    id: `brothel-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    startedYear: Number(state?.year ?? state?.age ?? 0),
    candidates: Array.from({ length: 4 }, (_, index) => ({
      ...createCourtesanCandidate(index),
      ...BROTHEL_ARCHETYPES[index],
      portrait: BROTHEL_PORTRAITS[index % BROTHEL_PORTRAITS.length],
      price: randInt(70, 135) + index * 25,
      visits: 0,
    })),
  });
}

function normalizeCourtesanVisit(visit) {
  if (!visit || typeof visit !== "object" || !Array.isArray(visit.candidates)) return null;
  const candidates = visit.candidates.slice(0, 4).map((candidate, index) => ({
    ...normalizeCourtesanCandidate({ ...candidate, portrait: candidate.portrait || BROTHEL_PORTRAITS[index % BROTHEL_PORTRAITS.length] }, index),
    price: clampNumber(candidate.price, 60, 600, 100 + index * 30),
    visits: Math.max(0, Math.round(Number(candidate.visits) || 0)),
  }));
  if (!candidates.length) return null;
  return {
    id: visit.id || `brothel-${Date.now()}`,
    startedYear: Number.isFinite(Number(visit.startedYear)) ? Number(visit.startedYear) : 0,
    candidates,
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

function createPoetryState() {
  return { wins: 0, losses: 0, attended: 0, lastYear: -1 };
}

function normalizePoetry(poetry) {
  const source = poetry && typeof poetry === "object" ? poetry : {};
  return {
    wins: Math.max(0, Math.round(Number(source.wins) || 0)),
    losses: Math.max(0, Math.round(Number(source.losses) || 0)),
    attended: Math.max(0, Math.round(Number(source.attended) || 0)),
    lastYear: Number.isFinite(Number(source.lastYear)) ? Number(source.lastYear) : -1,
  };
}

function normalizePoetryRound(round) {
  if (!round || typeof round !== "object") return null;
  const upper = String(round.upper || "").trim();
  const options = Array.isArray(round.options)
    ? round.options
        .map((item) => ({
          text: String(item?.text || "").trim(),
          good: !!item?.good,
          perfect: !!item?.perfect,
          note: String(item?.note || "").trim(),
        }))
        .filter((item) => item.text)
        .slice(0, 4)
    : [];
  if (!upper || options.length < 2) return null;
  return { upper, options, cost: Math.max(0, Math.round(Number(round.cost) || 20)) };
}

function createTravelCodexState() {
  return { unlocked: [] };
}

function normalizeTravelCodex(codex) {
  const source = codex && typeof codex === "object" ? codex : {};
  const valid = new Set(TRAVEL_LANDMARKS.map((item) => item.id));
  const unlocked = [...new Set((Array.isArray(source.unlocked) ? source.unlocked : []).map(String).filter((id) => valid.has(id)))];
  return { unlocked };
}

function createLeisureSeasonState(age = 0) {
  return {
    seasonKey: Math.floor(Math.max(0, age) / 3),
    cricketWins: 0,
    cricketStreak: 0,
    gambleWins: 0,
    gambleLosses: 0,
    gambleStreak: 0,
    titles: [],
    blacklistedUntil: -1,
  };
}

function normalizeLeisureSeason(season, age = 0) {
  const source = season && typeof season === "object" ? season : {};
  const currentKey = Math.floor(Math.max(0, Number(age) || 0) / 3);
  const seasonKey = Number.isFinite(Number(source.seasonKey)) ? Number(source.seasonKey) : currentKey;
  const reset = seasonKey !== currentKey;
  return {
    seasonKey: currentKey,
    cricketWins: reset ? 0 : Math.max(0, Math.round(Number(source.cricketWins) || 0)),
    cricketStreak: reset ? 0 : Math.max(0, Math.round(Number(source.cricketStreak) || 0)),
    gambleWins: reset ? 0 : Math.max(0, Math.round(Number(source.gambleWins) || 0)),
    gambleLosses: reset ? 0 : Math.max(0, Math.round(Number(source.gambleLosses) || 0)),
    gambleStreak: reset ? 0 : Math.max(0, Math.round(Number(source.gambleStreak) || 0)),
    titles: Array.isArray(source.titles) ? [...new Set(source.titles.map(String))].slice(0, 24) : [],
    blacklistedUntil: Math.max(-1, Math.round(Number(source.blacklistedUntil) || -1)),
  };
}

function ensureLeisureSeason() {
  state.leisureSeason = normalizeLeisureSeason(state.leisureSeason, state.age);
  return state.leisureSeason;
}

function secretDef(id) {
  return SECRET_DEFS.find((item) => item.id === id) || null;
}

function normalizeSecrets(secrets) {
  if (!Array.isArray(secrets)) return [];
  return secrets
    .map((item) => {
      const def = secretDef(item?.id);
      if (!def) return null;
      return {
        id: def.id,
        acquiredAge: Math.max(0, Math.round(Number(item.acquiredAge) || 0)),
        exposed: !!item.exposed,
        exposedAge: item.exposed ? Math.max(0, Math.round(Number(item.exposedAge) || 0)) : null,
      };
    })
    .filter(Boolean)
    .slice(0, 8);
}

function normalizeMatchCandidate(candidate) {
  const source = candidate && typeof candidate === "object" ? candidate : null;
  if (!source) return null;
  const tier = MATCH_FAMILY_TIERS.find((item) => item.id === source.familyId) || MATCH_FAMILY_TIERS[1];
  const personality = MATCH_PERSONALITIES.find((item) => item.id === source.personalityId) || MATCH_PERSONALITIES[0];
  const gender = source.gender === "male" ? "male" : "female";
  const name = String(source.name || "").trim() || makePersonName(gender);
  return {
    id: source.id || `match-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    name,
    gender,
    age: clamp(Math.round(Number(source.age) || randInt(16, 28)), 15, 40),
    familyId: tier.id,
    familyName: tier.name,
    power: clamp(Math.round(Number(source.power ?? tier.power)), 1, 100),
    fertility: clamp(Math.round(Number(source.fertility ?? tier.fertility)), 20, 95),
    bridePrice: Math.max(40, Math.round(Number(source.bridePrice ?? tier.brideBase) || tier.brideBase)),
    personalityId: personality.id,
    personality: personality.name,
    looks: clamp(Math.round(Number(source.looks) || randInt(40, 88))),
    knowledge: clamp(Math.round(Number(source.knowledge) || randInt(30, 80))),
    note: String(source.note || `${tier.note} 性情${personality.name}。`).trim(),
  };
}

function generateMatchCandidate(forcedGender) {
  const gender = forcedGender || (state.gender === "male" ? "female" : "male");
  const tier = sample(MATCH_FAMILY_TIERS) || MATCH_FAMILY_TIERS[1];
  const personality = sample(MATCH_PERSONALITIES) || MATCH_PERSONALITIES[0];
  const looks = clamp(randInt(38, 92) + (tier.id === "noble" ? 6 : 0));
  const knowledge = clamp(randInt(28, 86) + (tier.id === "scholar" ? 12 : 0));
  const fertility = clamp(tier.fertility + randInt(-10, 10) + (personality.id === "plain" ? 6 : 0));
  const power = clamp(tier.power + randInt(-8, 10));
  const bridePrice = Math.max(50, Math.round(tier.brideBase * (0.75 + Math.random() * 0.7) + looks * 1.2 + power * 1.5));
  return normalizeMatchCandidate({
    name: makePersonName(gender),
    gender,
    age: randInt(16, 28),
    familyId: tier.id,
    power,
    fertility,
    bridePrice,
    personalityId: personality.id,
    looks,
    knowledge,
    note: `${tier.note} 性情${personality.name}，容止约 ${looks}，识书约 ${knowledge}。`,
  });
}

function refreshMatchPool(force = false) {
  if (!state) return [];
  if (!force && Array.isArray(state.matchPool) && state.matchPool.length) {
    state.matchPool = state.matchPool.map(normalizeMatchCandidate).filter(Boolean);
    if (state.matchPool.length) return state.matchPool;
  }
  const gender = state.gender === "male" ? "female" : "male";
  state.matchPool = [generateMatchCandidate(gender), generateMatchCandidate(gender), generateMatchCandidate(gender)];
  return state.matchPool;
}

function matchSummary(profile) {
  const candidate = normalizeMatchCandidate(profile);
  if (!candidate) return "未详";
  return `${candidate.familyName} · ${candidate.personality} · 彩礼 ${moneyText(candidate.bridePrice)} · 生育 ${candidate.fertility}`;
}

function unlockTravelLandmark(id, deltas = [], options = {}) {
  const landmark = TRAVEL_LANDMARKS.find((item) => item.id === id);
  if (!landmark || !state) return false;
  state.travelCodex = normalizeTravelCodex(state.travelCodex);
  if (state.travelCodex.unlocked.includes(landmark.id)) return false;
  state.travelCodex.unlocked.push(landmark.id);
  deltas.push({ label: "奇遇", value: landmark.name, type: "text" });
  if (options.log !== false) {
    addLog("旅中奇遇", `足迹记入图鉴：${landmark.name}。${landmark.note}`, deltas.slice(-1));
  }
  changeStat("mood", randInt(1, 3), deltas);
  if (Math.random() > 0.55) changeStat("knowledge", randInt(0, 2), deltas);
  return true;
}

function tryUnlockTravelLandmarks(ids = [], deltas = [], chance = 0.72) {
  let unlocked = 0;
  for (const id of ids) {
    if (Math.random() > chance) continue;
    if (unlockTravelLandmark(id, deltas, { log: true })) unlocked += 1;
  }
  return unlocked;
}

function openPoetryContest() {
  if (!state || state.dead || state.prisonYears > 0 || state.age < 12) return;
  state.poetry = normalizePoetry(state.poetry);
  if (state.poetry.lastYear === state.year) {
    finishAction("诗会", "今年已赴过诗会，来年再去也不迟。", [], "MainBook");
    return;
  }
  const cost = state.age < 16 ? 8 : 20;
  if (state.stats.money < cost) return;
  const base = sample(POETRY_ROUNDS) || POETRY_ROUNDS[0];
  const options = shuffle(base.options.map((item) => ({ ...item })));
  state.poetryRound = normalizePoetryRound({ upper: base.upper, options, cost });
  view.page = "poetry";
  save();
  render();
}

function cancelPoetryContest() {
  if (!state) return;
  state.poetryRound = null;
  view.page = "place";
  view.placeId = "";
  save();
  render();
}

function answerPoetry(optionIndex) {
  if (!state || state.dead || !state.poetryRound) return;
  const round = normalizePoetryRound(state.poetryRound);
  if (!round) {
    state.poetryRound = null;
    save();
    render();
    return;
  }
  const option = round.options[Number(optionIndex)];
  if (!option) return;
  const cost = Math.min(round.cost, Math.max(0, state.stats.money));
  const deltas = [];
  changeStat("money", -cost, deltas);
  if (cost) addLedger("诗会束脩", -cost, "赴诗会雅集。");
  state.poetry = normalizePoetry(state.poetry);
  state.poetry.attended += 1;
  state.poetry.lastYear = state.year;
  const knowledgeBoost = state.stats.knowledge / 140;
  const success = option.good || (!option.good && Math.random() + knowledgeBoost > 1.18);
  const perfect = option.perfect && option.good;
  if (success) {
    state.poetry.wins += 1;
    changeStat("knowledge", perfect ? randInt(5, 10) : randInt(3, 7), deltas);
    changeStat("favorability", perfect ? randInt(3, 7) : randInt(1, 4), deltas);
    changeStat("mood", randInt(2, 6), deltas);
    changeStat("eq", randInt(0, 3), deltas);
    if (!state.tags.includes("诗会")) state.tags.push("诗会");
    if (perfect && !state.tags.includes("压卷")) state.tags.push("压卷");
  } else {
    state.poetry.losses += 1;
    changeStat("mood", -randInt(3, 8), deltas);
    changeStat("favorability", -randInt(0, 3), deltas);
    if (Math.random() > 0.55 && !state.tags.includes("出丑")) state.tags.push("出丑");
  }
  const title = success ? (perfect ? "诗会压卷" : "诗会称善") : "诗会失言";
  const text = success
    ? `上联「${round.upper}」，你对「${option.text}」。${option.note}${perfect ? " 满座称绝。" : " 座中点头称善。"}`
    : `上联「${round.upper}」，你对「${option.text}」。${option.note} 有人掩袖低笑，你面上发热。`;
  state.poetryRound = null;
  view.page = "main";
  finishAction(title, text, deltas, "MainBook");
}

function recordGambleSeasonResult(won, deltas = []) {
  const season = ensureLeisureSeason();
  if (won) {
    season.gambleWins += 1;
    season.gambleStreak += 1;
    season.gambleLosses = 0;
    for (const title of GAMBLE_SEASON_TITLES) {
      if (season.gambleStreak >= title.need && !season.titles.includes(title.id)) {
        season.titles.push(title.id);
        deltas.push({ label: "名号", value: title.name, type: "text" });
        addLog("赌坊名号", `本季连胜，得名号「${title.name}」：${title.desc}`, [{ label: "名号", value: title.name }]);
      }
    }
  } else {
    season.gambleLosses += 1;
    season.gambleStreak = 0;
    if (season.gambleLosses >= 4 && season.blacklistedUntil < state.age) {
      season.blacklistedUntil = state.age + randInt(1, 2);
      deltas.push({ label: "博坊", value: "列入黑名单", negative: true, type: "text" });
      addLog("赌坊黑名单", `你连番输钱，博坊掌柜冷脸相待，约 ${season.blacklistedUntil} 岁前不宜再入。`, [{ label: "黑名单", value: `至${season.blacklistedUntil}岁`, negative: true }]);
      changeStat("mood", -randInt(2, 5), deltas);
    }
  }
}

function isGambleBlacklisted() {
  const season = ensureLeisureSeason();
  return season.blacklistedUntil >= 0 && state.age <= season.blacklistedUntil;
}

function recordCricketSeasonResult(won, contest, deltas = []) {
  if (!contest) return;
  const season = ensureLeisureSeason();
  if (won) {
    season.cricketWins += 1;
    season.cricketStreak += 1;
    for (const title of CRICKET_SEASON_TITLES) {
      if (season.cricketWins >= title.need && !season.titles.includes(title.id)) {
        season.titles.push(title.id);
        deltas.push({ label: "名号", value: title.name, type: "text" });
        addLog("促织名号", `府城大赛本季传开你的名号「${title.name}」：${title.desc}`, [{ label: "名号", value: title.name }]);
        changeStat("favorability", randInt(1, 3), deltas);
      }
    }
  } else {
    season.cricketStreak = 0;
  }
}

function seasonTitleNames(ids = []) {
  const map = Object.fromEntries([...CRICKET_SEASON_TITLES, ...GAMBLE_SEASON_TITLES].map((item) => [item.id, item.name]));
  return ids.map((id) => map[id] || id).filter(Boolean);
}

function activeSecrets() {
  return (state.secrets || []).filter((item) => item && !item.exposed);
}

function hasSecret(id) {
  return (state.secrets || []).some((item) => item?.id === id && !item.exposed);
}

function acquireSecret(id, deltas = [], options = {}) {
  const def = secretDef(id);
  if (!def || !state) return false;
  state.secrets = normalizeSecrets(state.secrets);
  if (state.secrets.some((item) => item.id === id)) return false;
  state.secrets.push({ id, acquiredAge: state.age, exposed: false, exposedAge: null });
  if (def.tag && !state.tags.includes(def.tag)) state.tags.push(def.tag);
  deltas.push({ label: "秘密", value: def.name, type: "text" });
  if (options.silent) return true;
  changeStat("mood", randInt(-2, 3), deltas);
  return true;
}

function exposeSecret(secret, deltas = []) {
  const def = secretDef(secret?.id);
  if (!def || secret.exposed) return;
  secret.exposed = true;
  secret.exposedAge = state.age;
  applyEffectRanges(def.expose, deltas);
  if (def.tag) state.tags = state.tags.filter((tag) => tag !== def.tag);
  if (!state.tags.includes("事发")) state.tags.push("事发");
  if (def.mayPrison && Math.random() > 0.55) {
    imposePrisonSentence(randInt(1, 2), `${def.name}败露`);
    deltas.push({ label: "牢狱", value: `${state.prisonYears}年`, negative: true });
  }
  addLog(def.exposeTitle, def.exposeText, deltas);
}

function runSecretYear(deltas = []) {
  state.secrets = normalizeSecrets(state.secrets);
  for (const secret of state.secrets) {
    if (secret.exposed) continue;
    const def = secretDef(secret.id);
    if (!def) continue;
    applyEffectRanges(def.benefit, deltas);
    const heldYears = Math.max(0, state.age - (secret.acquiredAge || 0));
    const risk = def.risk + heldYears * 0.01 + (state.stats.virtue < 35 ? 0.03 : 0) + (state.stats.favorability > 50 ? 0.02 : 0);
    if (Math.random() < risk) exposeSecret(secret, deltas);
  }
}

function offerRandomSecret(deltas = []) {
  if (!state || state.age < 18 || state.prisonYears > 0) return false;
  if (activeSecrets().length >= 2) return false;
  if (Math.random() > 0.14) return false;
  const pool = SECRET_DEFS.filter((item) => !state.secrets.some((secret) => secret.id === item.id));
  const def = sample(pool);
  if (!def) return false;
  state.pendingSurprise = {
    category: "暗事",
    title: "可隐之事",
    text: `${def.acquireNote} 若接住，每年或有暗利，却也随时可能败露。`,
    icon: def.icon || "Letter",
    secretOffer: def.id,
  };
  view.overlay = "surprise";
  return true;
}

function acceptSecretOffer() {
  if (!state?.pendingSurprise?.secretOffer) {
    state.pendingSurprise = null;
    view.overlay = "";
    save();
    render();
    return;
  }
  const id = state.pendingSurprise.secretOffer;
  const def = secretDef(id);
  const deltas = [];
  acquireSecret(id, deltas);
  state.pendingSurprise = null;
  view.overlay = "";
  if (def) finishAction("暗事沾身", `${def.acquireNote}${def.benefitNote}`, deltas, def.icon || "Letter");
  else {
    save();
    render();
  }
}

function declineSecretOffer() {
  if (!state) return;
  state.pendingSurprise = null;
  view.overlay = "";
  addLog("拒隐", "你摇头推开这段暗事，心想清清白白更好。", []);
  save();
  render();
}

function applySpouseProfileYear(deltas = []) {
  const profile = normalizeMatchCandidate(state.family?.spouseProfile);
  if (!profile || !state.family.spouse || state.family.spouseMeta?.alive === false) return;
  const tier = MATCH_FAMILY_TIERS.find((item) => item.id === profile.familyId) || MATCH_FAMILY_TIERS[0];
  const personality = MATCH_PERSONALITIES.find((item) => item.id === profile.personalityId) || MATCH_PERSONALITIES[0];
  const moneyGain = rangeValue(tier.moneyYear || [0, 0]);
  if (moneyGain) {
    changeStat("money", moneyGain, deltas);
    addLedger("姻亲资助", moneyGain, `${profile.familyName}娘家送来薄礼。`);
  }
  if (tier.favor && Math.random() > 0.45) changeStat("favorability", randInt(0, tier.favor > 5 ? 2 : 1), deltas);
  applyEffectRanges(
    Object.fromEntries(
      Object.entries(personality)
        .filter(([key]) => ["mood", "eq", "virtue", "knowledge", "relationship", "money"].includes(key))
        .map(([key, value]) => [key, value])
    ),
    deltas
  );
  if (Math.random() < (personality.conflict || 0.1)) {
    changeStat("mood", -randInt(1, 4), deltas);
    state.family.spouseAffection = clamp(Number(state.family.spouseAffection ?? 78) - randInt(1, 5));
    addLog("闺中争执", `你与${state.family.spouse}为家事口角几句，性情${personality.name}，有时也难全让。`, [{ label: "情分", value: state.family.spouseAffection }]);
  } else if (Math.random() > 0.7) {
    state.family.spouseAffection = clamp(Number(state.family.spouseAffection ?? 78) + randInt(1, 3));
  }
}

function openMatchmakerBoard() {
  if (!state || state.dead || state.prisonYears > 0 || state.age < 16) return;
  archiveDeceasedSpouse([]);
  if (state.family.spouse && state.family.spouseMeta?.alive !== false) {
    finishAction("媒人", "你已成婚，媒人拱手道喜，说改日再为子女操心也不迟。", [], "ArrangeMarriage");
    return;
  }
  refreshMatchPool(true);
  view.page = "matchmaker";
  save();
  render();
}

function selectMatchCandidate(candidateId) {
  if (!state || state.dead || (state.family.spouse && state.family.spouseMeta?.alive !== false) || state.age < 16) return;
  const candidate = (state.matchPool || []).map(normalizeMatchCandidate).find((item) => item?.id === candidateId);
  if (!candidate) return;
  const deltas = [];
  const fee = 30;
  if (state.stats.money < fee) {
    finishAction("媒资不足", `托媒细看需先付 ${moneyText(fee)}，你手头不足，只得改日再来。`, [], "ArrangeMarriage");
    return;
  }
  changeStat("money", -fee, deltas);
  if (fee) addLedger("媒资", -fee, "托媒人相看人家。");
  changeStat("relationship", randInt(2, 6), deltas);
  state.family.lover = candidate.name;
  state.family.loverMeta = normalizeRelative(
    {
      name: candidate.name,
      relation: "相看之人",
      gender: candidate.gender,
      age: candidate.age,
      affection: clamp(48 + Math.floor(candidate.looks / 5) + Math.floor(candidate.power / 10)),
      alive: true,
    },
    state.name.slice(0, 1),
    "partner"
  );
  state.family.loverProfile = candidate;
  state.family.spouseAffection = state.family.loverMeta.affection;
  state.matchPool = [];
  view.page = "relations";
  finishAction(
    "媒人细看",
    `媒人替你细说${candidate.name}：${candidate.familyName}，性情${candidate.personality}，开价彩礼约 ${moneyText(candidate.bridePrice)}，生育预期 ${candidate.fertility}。${candidate.note}`,
    deltas,
    "ArrangeMarriage"
  );
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

function yearAdvanceBlockReason() {
  if (!state || state.dead) return "此生已终。";
  if (state.eventResult) return "请先点「点击继续」关闭当前结果。";
  if (state.currentEvent) return "请先处理当前事件再推进流年。";
  if (state.pendingTravel) return "旅途未完，请先走完车马行程。";
  if (state.pendingCaravan) return "押镖途中，请先处理镖路上的抉择。";
  if (state.poetryRound) return "诗会文斗尚未结束，请先应对下联或弃局。";
  if (state.mystery?.active && view.page === "mystery") return "办案界面中。可点「先放下案卷」再推进流年。";
  if (state.pendingSurprise) return "请先处理眼前的惊喜弹窗。";
  return "";
}

function ensurePrisonState(reason = "") {
  const wasActive = !!state.prison?.active;
  const prisonState = state.prison && typeof state.prison === "object" ? state.prison : {};
  Object.assign(prisonState, normalizePrisonState(prisonState, state.prisonYears, state.age, state.gender));
  state.prison = prisonState;
  if (state.prisonYears > 0) {
    state.prison.active = true;
    state.prison.totalYears = Math.max(state.prison.totalYears, state.prison.yearsServed + state.prisonYears);
    if (!wasActive) {
      state.prison.entryAge = state.age;
      state.prison.yearsServed = 0;
      state.prison.reputation = 0;
      state.prison.guardFavor = 35;
      state.prison.inmateFavor = 40;
      state.prison.laborSkill = 0;
      state.prison.appeal = 0;
      state.prison.letters = 0;
      state.prison.recentEventIds = [];
      state.prison.cellmate = null;
      state.prison.guard = null;
      Object.assign(state.prison, normalizePrisonState(state.prison, state.prisonYears, state.age, state.gender));
    }
    if (!state.tags.includes("入狱")) state.tags.push("入狱");
  }
  if (reason) state.prison.lastReason = reason;
  return state.prison;
}

function imposePrisonSentence(years, reason = "案情获罪") {
  const sentence = Math.max(1, Math.round(Number(years) || 1));
  state.prisonYears = Math.max(Number(state.prisonYears) || 0, sentence);
  const prison = ensurePrisonState(reason);
  prison.totalYears = Math.max(prison.totalYears, prison.yearsServed + state.prisonYears);
  return sentence;
}

function prisonText(text) {
  const prison = ensurePrisonState();
  return String(text || "")
    .replaceAll("{guard}", prison.guard?.name || "当值狱卒")
    .replaceAll("{cellmate}", prison.cellmate?.name || "同监狱友")
    .replaceAll("{remaining}", String(state.prisonYears));
}

function createPrisonYearEvent(releaseCandidate = false) {
  const prison = ensurePrisonState();
  if (releaseCandidate) {
    return {
      id: "prison-release",
      kind: "prisonYear",
      releaseCandidate: true,
      title: "刑满开门",
      content: `清晨点名后，牢门没有再次落锁。${prison.guard.name}把旧衣与收押文书推到你面前：刑期已满，今日可出监。铁门之外既是自由，也是重新学着过日子的第一步。`,
      children: [
        { title: "核清文书", note: "确认案底与释放凭照，稳妥离监", text: "你逐页核对释放凭照，领回旧物，在门槛前郑重按下最后一个手印。", effects: { knowledge: 2, eq: 2 }, prison: { appeal: 3 } },
        { title: "与狱友作别", note: "若狱友情深，出狱后将成为故交", text: `你把仅剩的干粮留给${prison.cellmate.name}，约定若有重见之日，彼此都以清白身份相认。`, effects: { virtue: 3, relationship: 3 }, prison: { inmateFavor: 8 } },
        { title: "跨门迎光", note: "放下旧事，重整心境", text: "你没有回头。日光刺得眼睛发酸，街上的叫卖声却比任何乐曲都真切。", effects: { mood: 9, physique: 2 }, prison: { reputation: 2 } },
      ],
    };
  }
  let pool = PRISON_YEAR_EVENTS.filter((item) => !item.firstYear || prison.yearsServed === 1);
  if (prison.yearsServed === 1 && !prison.recentEventIds.includes("rules")) pool = PRISON_YEAR_EVENTS.filter((item) => item.id === "rules");
  const fresh = pool.filter((item) => !prison.recentEventIds.includes(item.id));
  const source = sample(fresh.length ? fresh : pool) || PRISON_YEAR_EVENTS[0];
  const event = cloneEvent(source);
  return {
    id: `prison-${event.id}`,
    prisonEventId: event.id,
    kind: "prisonYear",
    title: event.title,
    content: prisonText(event.content),
    children: event.choices.map((choice) => ({
      ...choice,
      text: prisonText(choice.text),
      content: prisonText(choice.text),
      note: `${choice.note || ""}${choice.cost ? ` · 需 ${moneyText(choice.cost)}` : ""}`,
      disabled: !!choice.cost && state.stats.money < choice.cost,
    })),
  };
}

function adjustPrisonMetrics(changes = {}, deltas = []) {
  const prison = ensurePrisonState();
  const labels = { reputation: "狱中声望", guardFavor: "狱卒态度", inmateFavor: "狱友情分", laborSkill: "劳作熟练", appeal: "申诉线索", letters: "家书" };
  for (const [key, amountValue] of Object.entries(changes || {})) {
    const amount = Number(amountValue) || 0;
    const before = Number(prison[key] || 0);
    prison[key] = key === "reputation" ? clamp(before + amount, -100, 100) : key === "letters" ? Math.max(0, before + amount) : clamp(before + amount);
    const actual = Math.round(prison[key] - before);
    if (actual) deltas.push({ label: labels[key] || key, value: actual, negative: actual < 0 });
  }
}

function changeSentence(amount, deltas = []) {
  const before = state.prisonYears;
  state.prisonYears = Math.max(0, Math.round(before + Number(amount || 0)));
  const actual = state.prisonYears - before;
  if (actual) deltas.push({ label: actual < 0 ? "减刑" : "加刑", value: `${Math.abs(actual)}年`, negative: actual > 0 });
}

function finalizePrisonRelease(deltas = [], note = "刑期已满") {
  const prison = ensurePrisonState();
  state.prisonYears = 0;
  state.tags = state.tags.filter((tag) => tag !== "入狱");
  prison.active = false;
  prison.releases += 1;
  if (prison.inmateFavor >= 68 && prison.cellmate?.name && !state.friends.some((friend) => friend.name === prison.cellmate.name)) {
    state.friends.push(normalizeFriend({
      name: prison.cellmate.name,
      gender: prison.cellmate.gender,
      age: prison.cellmate.age,
      relation: "狱中故交",
      affection: clamp(prison.inmateFavor),
      lastMet: state.age,
    }));
    deltas.push({ label: "故交", value: prison.cellmate.name });
  }
  addLog("出狱", `${note}。你结束了这段牢狱岁月，重见天日。`, deltas);
}

function resolvePrisonYear(event, choice) {
  const prison = ensurePrisonState();
  const deltas = [];
  let text = prisonText(choice.text || choice.content || choice.title);
  if (choice.cost) {
    if (state.stats.money < choice.cost) return;
    changeStat("money", -choice.cost, deltas);
    addLedger(`牢中 · ${event.title}`, -choice.cost, choice.title);
  }
  applyEffectRanges(choice.effects, deltas);
  adjustPrisonMetrics(choice.prison, deltas);
  if (choice.sentence) changeSentence(choice.sentence, deltas);
  if (choice.risk) {
    if (Math.random() < Number(choice.risk.chance || 0)) {
      text += ` ${prisonText(choice.risk.failText || "此举败露，反而招来责罚。")}`;
      applyEffectRanges(choice.risk.effects, deltas);
      adjustPrisonMetrics({ guardFavor: choice.risk.guardFavor || 0 }, deltas);
      if (choice.risk.sentence) changeSentence(choice.risk.sentence, deltas);
    } else {
      if (choice.risk.successText) text += ` ${prisonText(choice.risk.successText)}`;
      if (choice.risk.sentenceSuccess) changeSentence(choice.risk.sentenceSuccess, deltas);
    }
  }
  if (choice.test === "appeal") {
    const chance = clamp(18 + state.stats.knowledge * 0.34 + prison.appeal * 0.38 + prison.guardFavor * 0.12, 15, 86) / 100;
    if (Math.random() < chance) {
      const reduction = Math.min(state.prisonYears, prison.appeal >= 55 ? 2 : 1);
      if (reduction) changeSentence(-reduction, deltas);
      text += reduction ? " 秋审官采纳了状纸中的关键疑点，批下减刑。" : " 秋审官将你的申诉记入案卷，为离监洗清了一层疑云。";
      adjustPrisonMetrics({ appeal: -Math.min(20, prison.appeal) }, deltas);
      prison.records.unshift({ age: state.age, title: "申诉得准", text: "秋审复核后获得减刑。" });
    } else text += " 状纸虽递入案卷，却因证据不足被驳回。";
  }
  if (choice.test === "inmates") {
    const chance = clamp(16 + prison.inmateFavor * 0.48 + prison.reputation * 0.22, 12, 82) / 100;
    if (Math.random() < chance) {
      const reduction = Math.min(1, state.prisonYears);
      if (reduction) changeSentence(-reduction, deltas);
      text += " 联名证词被秋审官采信，你因狱中表现获准减刑。";
      prison.records.unshift({ age: state.age, title: "众证减刑", text: "狱友联名作证，秋审从宽。" });
    } else text += " 联名证词分量不足，刑期未改。";
  }
  prison.lastEventId = event.prisonEventId || event.id;
  prison.recentEventIds = [prison.lastEventId, ...prison.recentEventIds.filter((id) => id !== prison.lastEventId)].slice(0, 6);
  prison.records.unshift({ age: state.age, title: event.title, choice: choice.title, text });
  prison.records = prison.records.slice(0, 24);
  state.lastDeltas = deltas;
  state.currentEvent = null;
  state.pendingAnnualEvent = null;
  if (event.releaseCandidate && state.prisonYears <= 0) finalizePrisonRelease(deltas, "刑满开门");
  addLog(`牢狱 · ${event.title}`, text, deltas);
  state.eventResult = { title: choice.title, text, deltas, icon: "PrisonHeader", scene: event.releaseCandidate ? "petal" : "ember" };
  unlockLifeGoals();
  if (shouldDie() && !state.dead) die("病殁狱中");
  save();
  render();
}

function culturalCompanionText() {
  const spouse = state.family?.spouse?.alive !== false ? state.family?.spouse : null;
  const child = livingChildren()[0];
  if (spouse && child) return `你与${spouse.name}带着${child.name}`;
  if (spouse) return `你与${spouse.name}`;
  if (child) return `你带着${child.name}`;
  if (state.age < 15) return "你随家中长辈";
  return "你与邻里亲友";
}

function culturalPublicChoice(item) {
  const kind = careerKind();
  if (kind === "official") return { title: "以官身行岁令", note: "把节令化为地方治理与惠民之举", text: `你命吏员依${item.name}时序巡视仓廪、水利与鳏寡之家，又向乡里讲明“${item.customs}”背后的秩序与人情。`, effects: { favorability: 5, virtue: 4, eq: 2 } };
  if (kind === "caravan") return { title: "随商路观风俗", note: "比较各地岁时物候与市集", text: `你随车马经过数处乡镇，发现同是${item.name}，各地在${item.customs}上各有变体，便把见闻记进路簿。`, effects: { knowledge: 4, money: 35, favorability: 2 } };
  if (["craft", "art", "female"].includes(kind)) return { title: "以本业应节", note: "用手艺参与乡里的节令生活", text: `你依本业制成应${item.name}之物，既取“${item.customs}”的意趣，也让街坊看见传统并非故纸，而在每日器用之间。`, effects: { knowledge: 3, favorability: 4, money: 24 } };
  if (kind === "mystic") return { title: "为乡人讲时序", note: "辨物候、说养藏，不作怪力乱神", text: `你借${item.name}向来客解释天时、农事与起居之理，提醒众人敬畏自然，却不把祸福都推给鬼神。`, effects: { knowledge: 5, virtue: 3, favorability: 3 } };
  return { title: "与乡里共此日", note: "参与公共礼俗，体会一方人情", text: `社鼓与市声渐起，你同乡人一起${item.customs}。礼俗不只热闹，也把陌生人重新连成一处共同生活的乡里。`, effects: { relationship: 4, favorability: 3, mood: 3 } };
}

function createCulturalEvent(item) {
  const season = CULTURAL_SEASONS[item.season];
  const companion = culturalCompanionText();
  const familyText = item.type === "festival"
    ? `${companion}照旧俗${item.customs}，晚间围坐分食${item.food}。席间有人说起往年旧事，年轻人也问起这些礼俗为何代代相传。`
    : `${companion}观察“${item.phenology}”的变化，又依时做了${item.customs}。一日细事，让节气不再只是历书上的两个字。`;
  const reflectText = item.type === "festival"
    ? `你查阅旧书并请教乡老，明白${item.name}所重在“${item.meaning}”。你没有把旧俗照单全收，而是记下其中珍惜亲情、敬畏生命与守望相助的部分。`
    : `你把${item.name}的物候、农事与身体感受写成短记：${item.phenology}；起居则宜“${item.care}”。从此再见天色变化，心里便多了一层尺度。`;
  return {
    id: item.id,
    kind: "culturalEvent",
    culturalId: item.id,
    season: item.season,
    culturalType: item.type,
    title: item.name,
    content: item.type === "festival" ? `${season.name}时岁事 · ${item.meaning}。今岁乡里照例${item.customs}，你打算如何度过？` : `${season.name}时节令 · ${item.phenology}。历书翻到${item.name}，天时、农事与人的生活都悄悄换了一层。`,
    children: [
      { title: "与家人守俗", note: item.type === "festival" ? `${item.customs} · ${item.food}` : `${item.customs} · ${item.care}`, text: familyText, content: familyText, choiceType: "family", effects: { relationship: 5, mood: 5, virtue: 2 } },
      { ...culturalPublicChoice(item), choiceType: "public" },
      { title: "访古问今", note: item.type === "festival" ? "读旧志、问乡老，理解礼俗源流" : "观物候、记农事与养生之理", text: reflectText, content: reflectText, choiceType: "reflection", effects: { knowledge: 6, virtue: 2, mood: 2 } },
    ],
  };
}

function annualCulturalEvent() {
  if (!state || state.dead || state.prisonYears > 0 || state.age < 2) return null;
  state.culturalCalendar = normalizeCulturalCalendar(state.culturalCalendar);
  const calendar = state.culturalCalendar;
  const seasons = Object.keys(CULTURAL_SEASONS);
  const season = seasons[calendar.total % seasons.length];
  const preferredType = calendar.total % 2 === 0 ? "term" : "festival";
  const unseen = CULTURAL_CALENDAR_ITEMS.filter((item) => !calendar.seen.includes(item.id));
  const pickFrom = (list, predicate) => list.filter(predicate);
  const pools = [
    pickFrom(unseen, (item) => item.season === season && item.type === preferredType),
    pickFrom(unseen, (item) => item.season === season),
    pickFrom(unseen, (item) => item.type === preferredType),
    unseen,
    CULTURAL_CALENDAR_ITEMS.filter((item) => item.season === season && !calendar.recentIds.includes(item.id)),
    CULTURAL_CALENDAR_ITEMS.filter((item) => !calendar.recentIds.includes(item.id)),
    CULTURAL_CALENDAR_ITEMS,
  ];
  const item = sample(pools.find((pool) => pool.length) || CULTURAL_CALENDAR_ITEMS);
  return item ? createCulturalEvent(item) : null;
}

function resolveCulturalEvent(event, choice) {
  const deltas = [];
  applyEffectRanges(choice.effects, deltas);
  const calendar = state.culturalCalendar = normalizeCulturalCalendar(state.culturalCalendar);
  const item = CULTURAL_CALENDAR_ITEMS.find((entry) => entry.id === event.culturalId) || { id: event.culturalId, type: event.culturalType, season: event.season, name: event.title };
  if (!calendar.seen.includes(item.id)) calendar.seen.push(item.id);
  calendar.total += 1;
  calendar.lastId = item.id;
  calendar.recentIds = [item.id, ...calendar.recentIds.filter((id) => id !== item.id)].slice(0, 10);
  calendar.seasonCounts[item.season] = (calendar.seasonCounts[item.season] || 0) + 1;
  if (item.type === "festival") calendar.festivalCount += 1;
  else calendar.termCount += 1;
  const choiceKey = `${choice.choiceType || "reflection"}Choices`;
  calendar[choiceKey] = (calendar[choiceKey] || 0) + 1;
  calendar.records[item.id] = { count: Math.max(0, Number(calendar.records[item.id]?.count) || 0) + 1, age: state.age, choice: choice.title };
  state.lastDeltas = deltas;
  state.currentEvent = null;
  const text = choice.text || choice.content || choice.title;
  addLog(`岁时 · ${item.name}`, text, deltas);
  state.eventResult = { title: `${item.name} · ${choice.title}`, text, deltas, icon: item.type === "festival" ? "Temple" : "MainBook", scene: item.season === "winter" ? "ember" : item.season === "autumn" ? "ink" : item.season === "summer" ? "lantern" : "petal" };
  unlockLifeGoals();
  save();
  render();
}

function recordWorldHistory(title, text, type = "incident") {
  state.dynasty.history.unshift({ year: state.year, age: state.age, title, text, type });
  state.dynasty.history = state.dynasty.history.slice(0, 30);
  state.dynasty.headline = text;
}

function enthroneNewRuler() {
  const world = state.dynasty;
  const oldRuler = world.rulerName;
  const oldEra = world.eraName;
  world.rulerName = makePersonName("male");
  world.rulerAge = randInt(18, 42);
  world.reignYear = 1;
  world.eraName = sample(DYNASTY_ERA_NAMES.filter((name) => name !== oldEra)) || "新元";
  world.temperamentId = sample(RULER_TEMPERAMENTS)?.id || "diligent";
  world.successions += 1;
  changeWorldValue("stability", -randInt(3, 10), null);
  changeWorldValue("factions.court", randInt(-8, 8), null);
  changeWorldValue("factions.military", randInt(-6, 8), null);
  recordWorldHistory("新帝改元", `${oldRuler}驾崩，${world.rulerName}继位，改元${world.eraName}。朝野观望，新旧人事开始更替。`, "succession");
}

function advanceDynastyYear(deltas = []) {
  state.dynasty = normalizeDynastyState(state.dynasty);
  const world = state.dynasty;
  world.reignYear += 1;
  world.rulerAge += 1;
  const temperament = dynastyTemperament();
  const temperamentChanges = {
    diligent: { prosperity: 1, "local.sentiment": 1, treasury: -1 },
    reformer: { corruption: -1, stability: Math.random() < 0.5 ? -1 : 1, factions: { reformers: 1 } },
    martial: { borderThreat: -1, treasury: -2, factions: { military: 1 } },
    suspicious: { stability: -1, corruption: -1, factions: { court: 1 } },
    indulgent: { corruption: 2, treasury: -1, "local.sentiment": -1, factions: { court: 1 } },
  };
  applyWorldChanges(temperamentChanges[temperament.id], null);
  changeWorldValue("local.disaster", -randInt(0, 3), null);
  changeWorldValue("local.epidemic", -randInt(0, 4), null);
  changeWorldValue("borderThreat", -randInt(0, 2), null);

  const deathChance = world.rulerAge >= 82 ? 1 : world.rulerAge >= 72 ? 0.2 : world.rulerAge >= 62 ? 0.07 : 0.015;
  if (Math.random() < deathChance && !world.activeArc) {
    enthroneNewRuler();
    deltas.push({ label: "朝局", value: `${world.eraName}元年` });
  } else if (Math.random() < 0.48) {
    const fresh = WORLD_INCIDENTS.filter((item) => item.id !== world.lastIncidentId);
    const incident = sample(fresh.length ? fresh : WORLD_INCIDENTS);
    if (incident) {
      applyWorldChanges(incident.effects, null);
      world.lastIncidentId = incident.id;
      recordWorldHistory(incident.title, incident.text);
      deltas.push({ label: "天下", value: incident.title, negative: ["flood-warning", "border-raid", "palace-spending", "epidemic"].includes(incident.id) });
    }
  } else {
    const phase = dynastyPhase(world);
    world.headline = `${world.eraName}${world.reignYear}年，天下处于${phase.name}：${phase.note}。`;
  }
  const grainTarget = clamp(Math.round(88 + world.local.disaster * 0.62 + world.borderThreat * 0.28 + world.local.epidemic * 0.2 - world.prosperity * 0.22), 55, 210);
  world.local.grainPrice = clamp(Math.round(world.local.grainPrice * 0.65 + grainTarget * 0.35), 45, 220);
}

function worldCareerRole() {
  const kind = careerKind();
  const name = state.career?.name || "";
  if (kind === "official") return "official";
  if (kind === "caravan" || /商|铺|掌柜|牙人/.test(name)) return "merchant";
  if (/医|郎中|药|稳婆/.test(name)) return "healer";
  if (/农|佃|田|庄稼/.test(name)) return "farmer";
  if (["craft", "art", "female"].includes(kind)) return "artisan";
  return "common";
}

function worldCareerImpactText() {
  const role = worldCareerRole();
  const world = state.dynasty;
  if (role === "official") return `安定 ${world.stability}、贪墨 ${world.corruption} 将影响官场考成与专案。`;
  if (role === "merchant") return `粮价 ${world.local.grainPrice}、治安 ${world.local.security}、边患 ${world.borderThreat} 决定商路风险。`;
  if (role === "healer") return `疫病 ${world.local.epidemic} 决定病患与收入，也会增加染病风险。`;
  if (role === "farmer") return `灾情 ${world.local.disaster}、粮价 ${world.local.grainPrice} 共同决定收成。`;
  return `粮价 ${world.local.grainPrice}、治安 ${world.local.security} 会改变日常开销与出行风险。`;
}

function applyWorldAnnualImpact(deltas = []) {
  const world = state.dynasty;
  if (!world || state.age < 15) return;
  const livingCost = Math.max(0, Math.round((world.local.grainPrice - 95) / 14));
  if (livingCost) changeStat("money", -livingCost, deltas);
  const role = worldCareerRole();
  if (role === "official") {
    const merit = Math.round((world.stability + world.local.sentiment - world.corruption) / 45) - 1;
    if (merit) {
      state.official.merit = Math.max(0, Number(state.official.merit || 0) + merit);
      deltas.push({ label: "天下考成", value: merit, negative: merit < 0 });
    }
  } else if (role === "merchant") {
    const trade = Math.round((world.prosperity + world.local.security - world.borderThreat) / 18) - 4;
    if (trade) changeStat("money", trade, deltas);
  } else if (role === "healer" && world.local.epidemic >= 35) {
    changeStat("money", Math.round(world.local.epidemic / 6), deltas);
    if (Math.random() < world.local.epidemic / 250) changeStat("physique", -randInt(2, 6), deltas);
  } else if (role === "farmer") {
    const harvest = Math.round((world.prosperity - world.local.disaster) / 12);
    if (harvest) changeStat("money", harvest, deltas);
  }
}

function significantNpcRefs() {
  const people = [
    state.family.father,
    state.family.mother,
    ...(state.family.siblings || []),
    state.family.spouseMeta,
    ...(state.family.concubines || []),
    ...(state.family.children || []),
    ...(state.friends || []),
  ].filter((person) => person && person.alive !== false);
  const seen = new Set();
  return people.filter((person) => {
    const key = person.id || person.name;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function ensureNpcAgency(person) {
  if (!person) return null;
  Object.assign(person, normalizeNpcAgency(person, person.relation, person.age));
  return person;
}

function rememberNpcMoment(person, type, text, impact = 0) {
  if (!ensureNpcAgency(person)) return;
  person.memories.unshift({ year: state.year, type, text, impact: Number(impact || 0) });
  person.memories = person.memories.slice(0, 8);
  if (impact) person.affection = clamp(Number(person.affection ?? 60) + impact);
}

function advanceNpcAgencyYear(deltas = []) {
  if (state.age < 8) return;
  const candidates = significantNpcRefs().filter((person) => Number(person.age || 0) >= 15 && Number(person.lastActionYear || -1) < state.year);
  const person = sample(candidates);
  if (!person) return;
  ensureNpcAgency(person);
  const world = state.dynasty;
  const roll = Math.random();
  let title = "亲友近况";
  let text = "";
  if (!person.marriedTo && person.age >= 18 && person.age <= 45 && !/父亲|母亲|妻子|夫君|配偶|妾室/.test(person.relation || "") && roll < 0.16) {
    person.marriedTo = makePersonName(person.gender === "female" ? "male" : "female");
    if (person.id?.startsWith?.("child-")) {
      person.spouse = normalizeRelative({ name: person.marriedTo, relation: person.gender === "female" ? "女婿" : "儿媳", gender: person.gender === "female" ? "male" : "female", age: Math.max(18, person.age + randInt(-3, 3)), affection: randInt(58, 82), alive: true }, state.name.slice(0, 1), "partner");
      person.marriageYear = state.year;
    }
    person.wealth = clamp(person.wealth - randInt(3, 12));
    person.lastAction = `与${person.marriedTo}成婚`;
    text = `${person.name}托人送来喜帖，已与${person.marriedTo}成婚另立门户。你们往后的来往，也多了一个新的家门。`;
    rememberNpcMoment(person, "婚姻", person.lastAction, 2);
  } else if (world.local.disaster >= 48 && ["重情", "豪爽", "刚直"].includes(person.disposition) && roll < 0.52) {
    const help = Math.min(person.wealth, randInt(5, 16));
    person.wealth = clamp(person.wealth - help);
    person.influence = clamp(person.influence + 3);
    person.lastAction = "参与乡里赈济";
    text = `${person.name}拿出积蓄参与赈济，还亲自帮着搭棚分粥。此事让乡里重新认识了这个${person.disposition}的人。`;
    rememberNpcMoment(person, "天下", person.lastAction, 1);
  } else if (world.borderThreat >= 55 && person.age <= 42 && ["进取", "刚直", "豪爽"].includes(person.disposition) && roll < 0.58) {
    person.occupation = "随军效力";
    person.influence = clamp(person.influence + randInt(4, 9));
    person.physique = clamp(person.physique - randInt(1, 5));
    person.lastAction = "投身边军";
    text = `${person.name}应募随军，来信说边关风硬，却不愿只在家中听战报。`;
    rememberNpcMoment(person, "志向", person.lastAction, person.affection >= 60 ? 2 : 0);
  } else if (/读书进身|光耀门楣/.test(person.ambition) && person.age <= 45 && roll < 0.62) {
    person.occupation = person.influence >= 55 ? "县学教谕" : "书塾助教";
    person.influence = clamp(person.influence + randInt(3, 8));
    person.wealth = clamp(person.wealth + randInt(2, 7));
    person.lastAction = `谋得${person.occupation}`;
    text = `${person.name}多年用功终于有了着落，如今在${person.occupation}，说话行事也比往日沉稳。`;
    rememberNpcMoment(person, "营生", person.lastAction, 1);
  } else if (roll < 0.78) {
    const gain = randInt(3, 10);
    person.wealth = clamp(person.wealth + gain);
    person.influence = clamp(person.influence + randInt(0, 3));
    person.lastAction = `${person.occupation}渐有起色`;
    text = `${person.name}今年在${person.occupation}上站稳脚跟，离“${person.ambition}”又近了一步。`;
    rememberNpcMoment(person, "营生", person.lastAction, 1);
  } else {
    const loss = randInt(4, 13);
    person.wealth = clamp(person.wealth - loss);
    person.lastAction = `${person.occupation}遭遇挫折`;
    text = `${person.name}今年诸事不顺，${person.occupation}折了本钱，却仍不肯放下“${person.ambition}”的念头。`;
    rememberNpcMoment(person, "挫折", person.lastAction, -1);
  }
  person.lastActionYear = state.year;
  if (text) {
    addLog(title, text, [{ label: person.relation || "亲友", value: person.name }]);
    deltas.push({ label: "亲友动向", value: person.name });
  }
}

function worldArcCandidates() {
  const world = state.dynasty;
  const available = Object.keys(WORLD_ARCS).filter((id) => !world.completedArcs.includes(id));
  const urgent = [];
  if (available.includes("flood") && world.local.disaster >= 42) urgent.push("flood");
  if (available.includes("succession") && (world.rulerAge >= 58 || world.stability <= 42 || world.factions.court >= 72)) urgent.push("succession");
  if (available.includes("border") && world.borderThreat >= 45) urgent.push("border");
  return urgent.length ? urgent : available;
}

function maybeStartWorldArc() {
  const world = state.dynasty;
  if (world.activeArc || state.age < 15 || state.year - world.lastArcYear < 4) return;
  const candidates = worldArcCandidates();
  const urgent = candidates.some((id) => id === "flood" && world.local.disaster >= 42 || id === "succession" && world.rulerAge >= 58 || id === "border" && world.borderThreat >= 45);
  if (!candidates.length || (!urgent && Math.random() > 0.28)) return;
  const id = sample(candidates);
  world.activeArc = { id, stage: 0, score: 0, dueYear: state.year, startedYear: state.year, choices: [] };
  recordWorldHistory(`${WORLD_ARCS[id].name} · 开端`, `一条将持续数年的天下主线已经开始：${WORLD_ARCS[id].stages[0].title}。`, "arc");
}

function worldApproachFitsRole(approach, role = worldCareerRole()) {
  const matches = {
    official: ["relief", "investigate", "law", "public", "truth", "balanced"],
    merchant: ["supply", "trade", "scout", "rebuild"],
    healer: ["healing", "relief", "public"],
    farmer: ["rebuild", "relief", "public"],
    artisan: ["supply", "rebuild", "public"],
    common: ["caution", "public", "relief"],
  };
  return (matches[role] || []).includes(approach);
}

function annualWorldArcEvent() {
  if (!state || state.dead || state.prisonYears > 0 || state.age < 15) return null;
  state.dynasty = normalizeDynastyState(state.dynasty);
  maybeStartWorldArc();
  const active = state.dynasty.activeArc;
  if (!active || active.dueYear > state.year) return null;
  const arc = WORLD_ARCS[active.id];
  const stage = arc?.stages?.[active.stage];
  if (!stage) {
    state.dynasty.activeArc = null;
    return null;
  }
  const role = worldCareerRole();
  return {
    id: `world-arc-${active.id}-${active.stage}`,
    kind: "worldArc",
    arcId: active.id,
    arcStage: active.stage,
    title: stage.title,
    content: stage.content,
    icon: arc.icon,
    children: stage.choices.map((choice) => ({
      ...choice,
      content: choice.text,
      note: `${choice.note}${worldApproachFitsRole(choice.approach, role) ? ` · ${state.career?.name || "当前身份"}可发挥专长` : ""}${choice.cost ? ` · 需 ${moneyText(choice.cost)}` : ""}`,
      disabled: !!choice.cost && state.stats.money < choice.cost,
    })),
  };
}

function resolveWorldArcEvent(event, choice) {
  const world = state.dynasty;
  const active = world.activeArc;
  if (!active || active.id !== event.arcId || active.stage !== event.arcStage) return;
  const deltas = [];
  if (choice.cost) {
    if (state.stats.money < choice.cost) return;
    changeStat("money", -choice.cost, deltas);
    addLedger(`天下 · ${event.title}`, -choice.cost, choice.title);
  }
  applyEffectRanges(choice.effects, deltas);
  applyWorldChanges(choice.world, deltas);
  const roleBonus = worldApproachFitsRole(choice.approach) ? 1 : 0;
  active.score += Number(choice.score || 0) + roleBonus;
  active.choices.push(choice.approach || choice.title);
  const witness = state.family.spouseMeta || sample(state.family.siblings || []) || sample(state.friends || []);
  if (witness) rememberNpcMoment(witness, "共同经历", `记得你在${event.title}时选择“${choice.title}”`, Number(choice.score || 0) > 0 ? 2 : Number(choice.score || 0) < 0 ? -2 : 0);
  let text = choice.text;
  const arc = WORLD_ARCS[active.id];
  const finalStage = active.stage >= arc.stages.length - 1;
  if (roleBonus) {
    text += ` 你凭借${state.career?.name || "过往阅历"}的经验，比旁人更快找到了着力之处。`;
    deltas.push({ label: "职业专长", value: "+1 主线评价" });
  }
  if (finalStage) {
    const strong = active.score >= 6;
    const failed = active.score <= 0;
    if (strong) {
      text += " 数年风波终于平息，你的选择被地方志郑重记下，许多人因此少受了一场苦。";
      applyWorldChanges({ prosperity: 5, stability: 5, "local.sentiment": 7, corruption: -3 }, deltas);
      changeStat("favorability", 6, deltas);
    } else if (failed) {
      text += " 风波虽暂告一段落，留下的亏空、怨气与伤亡却要许多年才能抚平。";
      applyWorldChanges({ stability: -5, "local.sentiment": -7, corruption: 4 }, deltas);
      changeStat("mood", -4, deltas);
    } else {
      text += " 风波在妥协中收场，天下没有因此倾覆，也没有真正治好旧患。";
    }
    if (active.id === "succession") {
      const formerRuler = world.rulerName;
      enthroneNewRuler();
      text += ` ${formerRuler}一朝至此结束，${world.rulerName}即位，改元${world.eraName}。`;
      deltas.push({ label: "改元", value: `${world.eraName}元年` });
    }
    if (!world.completedArcs.includes(active.id)) world.completedArcs.push(active.id);
    world.lastArcYear = state.year;
    recordWorldHistory(`${arc.name} · 终局`, text, "arc-complete");
    world.activeArc = null;
  } else {
    active.stage += 1;
    active.dueYear = state.year + 1;
    recordWorldHistory(`${arc.name} · ${event.title}`, text, "arc");
  }
  state.currentEvent = null;
  state.lastDeltas = deltas;
  addLog(`天下主线 · ${event.title}`, text, deltas);
  state.eventResult = { title: choice.title, text, deltas, icon: arc.icon || "Official", scene: event.arcId === "flood" ? "travel" : event.arcId === "border" ? "ember" : "ink" };
  unlockLifeGoals();
  save();
  render();
}

function nextYear() {
  const block = yearAdvanceBlockReason();
  if (block) {
    // 避免静默无响应：若只是弹窗挡着，刷新一次让用户看到提示
    if (state && !state.dead) {
      if (state.poetryRound) view.page = "poetry";
      if (state.pendingSurprise) view.overlay = "surprise";
      state.lastDeltas = [{ label: "流年", value: block, type: "text", negative: true }];
      save();
      render();
    }
    return;
  }
  try {
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

    advanceDynastyYear(state.lastDeltas);

    if (state.prisonYears > 0) {
      const prison = ensurePrisonState();
      prison.yearsServed += 1;
      state.prisonYears = Math.max(0, state.prisonYears - 1);
      applyAgeMilestones(state.lastDeltas);
      changeStat("mood", -randInt(1, 4), state.lastDeltas);
      changeStat("physique", randInt(-4, -1), state.lastDeltas);
      advanceFamilyYear(state.lastDeltas);
      advanceNpcAgencyYear(state.lastDeltas);
      advanceCricketYear(state.lastDeltas);
      if (shouldDie()) {
        die("病殁狱中");
        save();
        render();
        return;
      }
      state.currentEvent = createPrisonYearEvent(state.prisonYears <= 0);
      rememberEventKey(state.currentEvent);
      finishYear(false);
      return;
    }

    applyAgeMilestones(state.lastDeltas);
    if (typeof ensureLeisureSeason === "function") ensureLeisureSeason();
    changeStat("mood", randInt(-2, 2), state.lastDeltas);
    changeStat("physique", state.age > 55 ? randInt(-4, -1) : randInt(-1, 2), state.lastDeltas);
    changeStat("money", state.career ? randInt(18, 80) : randInt(-10, 25), state.lastDeltas);
    const assetIncome = annualAssetIncome();
    if (assetIncome) {
      changeStat("money", assetIncome, state.lastDeltas);
      addLedger("家产进项", assetIncome, "名下产业送来一年收益。");
    }
    assetMarketEvent(state.lastDeltas);
    applyWorldAnnualImpact(state.lastDeltas);
    if (state.diseases.length) changeStat("physique", -state.diseases.length, state.lastDeltas);
    advanceFamilyYear(state.lastDeltas);
    if (typeof applySpouseProfileYear === "function") applySpouseProfileYear(state.lastDeltas);
    advanceCricketYear(state.lastDeltas);
    if (typeof runSecretYear === "function") runSecretYear(state.lastDeltas);
    annualRelationEvent(state.lastDeltas);
    annualPartnerEvent(state.lastDeltas);
    advanceNpcAgencyYear(state.lastDeltas);

    if (shouldDie()) {
      die(state.age >= 100 ? "寿终正寝" : "体魄耗尽");
      save();
      render();
      return;
    }

    const annualEvent =
      annualWorldArcEvent() ||
      annualUnderworldEvent() ||
      annualJianghuEvent() ||
      annualFortuneEvent() ||
      annualFamilyStoryEvent() ||
      annualOfficialCaseEvent() ||
      annualSecretIntroductionEvent() ||
      chooseEvent();
    const culturalEvent = annualCulturalEvent();
    state.currentEvent = culturalEvent || annualEvent;
    state.pendingAnnualEvent = culturalEvent ? annualEvent : null;
    if (annualEvent) rememberEventKey(annualEvent);
    if (culturalEvent) rememberEventKey(culturalEvent);
    if (state.underworld) state.underworld.heat = clamp(Number(state.underworld.heat || 0) - randInt(2, 6));
    if (state.jianghu) state.jianghu.heat = clamp(Number(state.jianghu.heat || 0) - randInt(2, 6));
    // 有事件时不再叠惊喜弹窗，避免遮住选项导致“点不动”
    if (!state.currentEvent) {
      if (typeof offerRandomSecret === "function") {
        if (!offerRandomSecret(state.lastDeltas)) annualSurpriseEvent(state.lastDeltas);
      } else {
        annualSurpriseEvent(state.lastDeltas);
      }
      // 只有真的没抽出事件或惊喜时才记“平年”，避免秘密邀约与赠礼同时被写成平年
      if (!state.pendingSurprise) addLog("平年", "这一年无甚大事，日子仍照常向前。", state.lastDeltas);
    }
    finishYear(false);
  } catch (error) {
    console.error("nextYear failed", error);
    state.currentEvent = null;
    state.eventResult = {
      title: "流年受阻",
      text: "这一年事务繁杂，记录时出了岔子。已为你理顺案牍，可再点「下一年」继续。",
      deltas: state.lastDeltas || [],
      icon: "MainBook",
    };
    save();
    render();
  }
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
  const unlocked = [];
  for (const goal of LIFE_GOALS) {
    if (!goal?.id || typeof goal.done !== "function") continue;
    if (state.life.goals.includes(goal.id) || !goal.done()) continue;
    state.life.goals.push(goal.id);
    if (!state.tags.includes(goal.title)) state.tags.push(goal.title);
    unlocked.push(goal);
    addLog("成就解锁", `达成${achievementTierText(goal)}「${goal.title}」：${goal.desc}`, [{ label: ACHIEVEMENT_TIERS[goal.tier]?.name || "成就", value: goal.title }]);
  }
  if (unlocked.length) {
    const best = unlocked.sort((a, b) => achievementTierRank(b.tier) - achievementTierRank(a.tier))[0];
    state.pendingAchievement = {
      id: best.id,
      title: best.title,
      desc: best.desc,
      tier: best.tier || "bronze",
      icon: best.icon || "MainBook",
      count: unlocked.length,
    };
    SFX.play(best.tier === "gold" ? "win" : "milestone");
  }
}

function lifePhase() {
  return LIFE_PHASES.find((phase) => state.age <= phase.max) || LIFE_PHASES[LIFE_PHASES.length - 1];
}

function completedGoals() {
  const doneIds = new Set(state.life?.goals || []);
  return LIFE_GOALS.filter((goal) => doneIds.has(goal.id) || goal.done());
}

function nextGoals(limit = 3) {
  const doneIds = new Set(state.life?.goals || []);
  return LIFE_GOALS.filter((goal) => !doneIds.has(goal.id) && !goal.done()).slice(0, limit);
}

function achievementTierRank(tier = "bronze") {
  return { bronze: 1, silver: 2, gold: 3 }[tier] || 1;
}

function achievementTierText(goal) {
  const tier = ACHIEVEMENT_TIERS[goal?.tier || "bronze"] || ACHIEVEMENT_TIERS.bronze;
  return `${tier.label}章`;
}

function achievementsByTier() {
  const doneIds = new Set(completedGoals().map((goal) => goal.id));
  return Object.keys(ACHIEVEMENT_TIERS).map((tier) => {
    const goals = LIFE_GOALS.filter((goal) => (goal.tier || "bronze") === tier);
    const done = goals.filter((goal) => doneIds.has(goal.id));
    return { tier, meta: ACHIEVEMENT_TIERS[tier], goals, done };
  });
}

function officialExamHistory() {
  return (state.exam?.history || []).filter((item) => EXAM_STAGES.some((stage) => stage.name === item.stage));
}

function officialExamFailures() {
  return officialExamHistory().filter((item) => !item.passed).length;
}

function officialExamPassedCount() {
  return new Set(officialExamHistory().filter((item) => item.passed).map((item) => item.stage)).size;
}

function maxCareerLevel() {
  return Object.values(state.careerProgress || {}).reduce((max, item) => Math.max(max, Number(item?.level) || 0), state.career ? 1 : 0);
}

function relationCount() {
  return familyRows().filter((item) => item.alive !== false).length
    + (state.friends || []).filter((item) => item.alive !== false).length
    + livingChildren().length
    + (state.family.spouse ? 1 : 0)
    + (state.family.concubines || []).filter((item) => item.alive !== false).length;
}

function inventoryCount() {
  return (state.inventory || []).length + (state.crickets || []).length + (state.diseases || []).length + Object.values(state.femaleSkills || {}).filter((level) => Number(level) > 0).length;
}

function miniGameRounds() {
  const record = state.miniGames?.record || {};
  return Number(record.gomokuWins || 0) + Number(record.gomokuLosses || 0) + Number(record.gomokuDraws || 0) + Number(record.xiangqiWins || 0) + Number(record.xiangqiLosses || 0) + (Number(record.touhuBest || 0) > 0 ? 1 : 0);
}

function caravanRuns() {
  return Object.values(state.caravanMemory || {}).reduce((sum, memory) => sum + Math.max(0, Number(memory?.runs) || 0), 0);
}

function cricketWins() {
  return Number(state.cricketRecord?.wins || 0) + (state.crickets || []).reduce((sum, item) => sum + Number(item?.wins || 0), 0);
}

function cricketLosses() {
  return Number(state.cricketRecord?.losses || 0);
}

function allStatsAt(value) {
  return STAT_DEFS.every(([key]) => Number(state.stats?.[key] || 0) >= value);
}

function logHas(pattern) {
  return (state.log || []).some((item) => pattern.test(`${item.title || ""}${item.text || ""}`));
}

function lifeScore() {
  const statScore = Math.round((state.stats.mood + state.stats.physique + state.stats.eq + state.stats.knowledge + state.stats.virtue + state.stats.looks) / 6);
  const wealthScore = Math.min(180, Math.round(Math.max(0, state.stats.money) / 18) + (state.assets || []).length * 35);
  const relationScore = Math.min(140, relationCount() * 12);
  const examScore = Math.max(0, state.exam.rank + 1) * 70;
  const careerScore = Object.values(state.careerProgress || {}).reduce((sum, item) => sum + Math.max(1, Number(item.level) || 1) * 18, state.career ? 40 : 0);
  const goalScore = completedGoals().reduce((sum, goal) => sum + goal.score, 0);
  const sideScore = Math.min(100, (state.travelCodex?.unlocked || []).length * 8 + (state.poetry?.wins || 0) * 6 + (state.leisureSeason?.titles || []).length * 10 + (state.secrets || []).filter((item) => item && !item.exposed).length * 12);
  return statScore + wealthScore + relationScore + examScore + careerScore + goalScore + Math.min(120, state.log.length * 2) + sideScore;
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
  return goal ? goal.advice : "这一世成就大多已成，继续补命册、攒声名即可。";
}

function annualFamilyStoryEvent() {
  state.familyStories = normalizeFamilyStories(state.familyStories);
  const stories = state.familyStories;
  if (state.dead || state.prisonYears > 0) return null;

  if (stories.active) {
    const target = familyStoryTarget(stories.active);
    if (!target || target.alive === false) {
      completeFamilyStory(stories.active);
      return null;
    }
    if (stories.active.dueYear > state.year) return null;
    const built = buildFamilyStoryEvent(stories.active, target);
    // 构造失败时清掉卡死的 active 家事，避免流年永远被挡住
    if (!built) {
      completeFamilyStory(stories.active);
      return null;
    }
    return built;
  }

  if (state.year - stories.lastTriggerYear < 2 || Math.random() > 0.32) return null;
  const candidates = familyStoryCandidates();
  const candidate = sample(candidates);
  if (!candidate) return null;
  stories.active = {
    type: candidate.type,
    targetId: candidate.targetId,
    stage: "intro",
    choice: "",
    score: 0,
    dueYear: state.year,
    key: candidate.key,
  };
  stories.lastTriggerYear = state.year;
  return buildFamilyStoryEvent(stories.active, candidate.target);
}

function familyStoryCandidates() {
  const completed = new Set(state.familyStories?.completed || []);
  const candidates = [];
  for (const [targetId, parent] of [["father", state.family.father], ["mother", state.family.mother]]) {
    const key = `parent-illness-${targetId}`;
    if (state.age >= 10 && parent?.alive !== false && !completed.has(key) && (parent.age >= 48 || parent.physique <= 58)) {
      candidates.push({ type: "parentIllness", targetId, key, target: parent });
    }
  }
  for (const sibling of state.family.siblings || []) {
    const key = `sibling-division-${sibling.id || sibling.name}`;
    if (state.age >= 16 && sibling.alive !== false && sibling.age >= 18 && !sibling.householdSeparated && !completed.has(key)) {
      candidates.push({ type: "siblingDivision", targetId: sibling.id || sibling.name, key, target: sibling });
    }
  }
  for (const child of livingChildren()) {
    const key = `child-education-${child.id}`;
    if (child.age >= 6 && child.age <= 13 && !child.educationPath && !completed.has(key)) {
      candidates.push({ type: "childEducation", targetId: child.id, key, target: child });
    }
  }
  return candidates;
}

function familyStoryTarget(story) {
  if (!story) return null;
  if (story.type === "parentIllness") return story.targetId === "mother" ? state.family.mother : state.family.father;
  if (story.type === "siblingDivision") return (state.family.siblings || []).find((person) => person.id === story.targetId || person.name === story.targetId) || null;
  if (story.type === "childEducation") return (state.family.children || []).find((person) => person.id === story.targetId) || null;
  return null;
}

function buildFamilyStoryEvent(story, target) {
  if (!story || !target) return null;
  if (story.type === "parentIllness") {
    if (story.stage === "followup") {
      return {
        kind: "familyStory",
        title: `${target.name}病后一年`,
        content: `${target.name}调养已有一年。医药、照料与自身底子，如今都到了见分晓的时候。`,
        children: [{ title: "问候病况", note: "查看这一年的调养结果", familyEffect: "complete" }],
      };
    }
    return {
      kind: "familyStory",
      title: `${target.name}卧病`,
      content: `${target.name}近来咳喘乏力，体魄只余 ${Math.round(target.physique || 0)}。家中人心惶惶，都等你拿个主意。`,
      children: [
        { title: "请医延药", note: state.stats.money < 120 ? "需 120 铜钱（当前不足）" : "花费 120 铜钱，治疗最稳妥", familyEffect: "doctor", disabled: state.stats.money < 120 },
        { title: "亲自侍奉", note: "耗费自身精力，尽一份孝心（不会把自己累死）", familyEffect: "care" },
        { title: "暂且静养", note: "不花钱，但病情可能反复", familyEffect: "rest" },
      ],
    };
  }
  if (story.type === "siblingDivision") {
    if (story.stage === "followup") {
      return {
        kind: "familyStory",
        title: `${target.name}分家之后`,
        content: "一年过去，新灶新门都已安顿。旧日的一场商量，也终于显出它留在手足情分里的分量。",
        children: [{ title: "登门看看", note: "查看分家后的手足关系", familyEffect: "complete" }],
      };
    }
    return {
      kind: "familyStory",
      title: `${target.name}提出分家`,
      content: `${target.name}已经成人，想另立门户。父母舍不得，妯娌亲族也各有说法，这件家事落到了你面前。`,
      children: [
        { title: "按家产公断", note: "花费 60 铜钱置办文契，尽量两全", familyEffect: "mediate", disabled: state.stats.money < 60 },
        { title: "赠资成全", note: "拿出 120 铜钱扶持手足自立", familyEffect: "support", disabled: state.stats.money < 120 },
        { title: "挽留同住", note: "保住眼前团聚，也可能积下怨气", familyEffect: "hold" },
      ],
    };
  }
  if (story.stage === "followup") {
    return {
      kind: "familyStory",
      title: `${target.name}学业初成`,
      content: `${target.name}沿着你安排的道路走了两年，如今性情、本事与志向都有了新的模样。`,
      children: [{ title: "听孩子说志向", note: "查看教养道路的阶段结果", familyEffect: "complete" }],
    };
  }
  return {
    kind: "familyStory",
    title: `为${target.name}择一条路`,
    content: `${target.name}已到开蒙立志的年纪。是走书卷功名、拜师学艺，还是留在家中慢慢教养，需要你来决定。`,
    children: [
      { title: "送入书院", note: "花费 160 铜钱，重学识与科举", familyEffect: "academy", disabled: state.stats.money < 160 },
      { title: "拜师学艺", note: "花费 80 铜钱，重手艺与历练", familyEffect: "craft", disabled: state.stats.money < 80 },
      { title: "留家教养", note: "亲自教导，重德行与亲情", familyEffect: "home" },
    ],
  };
}

function resolveFamilyStory(event, choice) {
  const story = state.familyStories?.active;
  const target = familyStoryTarget(story);
  if (choice?.disabled) return;
  if (!story || !target || target.alive === false) {
    if (story) completeFamilyStory(story);
    state.currentEvent = null;
    state.eventResult = {
      title: "家事已了",
      text: "当事人已不在或这桩家事失去了对象，你只能把旧事翻过，继续往前过。",
      deltas: [],
      icon: "FamilyIcon",
    };
    save();
    render();
    return;
  }
  // 金额类选项以当前钱财实时判定，避免事件生成后钱变了却仍点不动
  if (choice.familyEffect === "doctor" && state.stats.money < 120) return;
  if (choice.familyEffect === "mediate" && state.stats.money < 60) return;
  if (choice.familyEffect === "support" && state.stats.money < 120) return;
  if (choice.familyEffect === "academy" && state.stats.money < 160) return;
  if (choice.familyEffect === "craft" && state.stats.money < 80) return;
  const deltas = [];
  let title = choice.title || event.title || "家事";
  let text = "这件家事有了新的进展。";

  if (story.stage === "followup" || choice.familyEffect === "complete") {
    ({ title, text } = finishFamilyStoryOutcome(story, target, deltas));
    completeFamilyStory(story);
  } else {
    const effect = choice.familyEffect || "";
    story.choice = effect;
    if (story.type === "parentIllness") {
      if (effect === "doctor") {
        changeStat("money", -120, deltas);
        addLedger("父母医药", -120, `为${target.name}延医用药。`);
        target.physique = clamp(Number(target.physique || 0) + 18);
        target.affection = clamp(Number(target.affection || 0) + 8);
        story.score = 3;
        text = `你请来医者细细诊治，又照方抓药。${target.name}的气色渐渐稳住。`;
      } else if (effect === "care") {
        // 侍疾不应直接把玩家体魄扣到致死
        const careCost = Math.min(4, Math.max(0, Math.round(state.stats.physique) - 1));
        if (careCost) changeStat("physique", -careCost, deltas);
        changeStat("mood", -2, deltas);
        changeStat("virtue", 3, deltas);
        target.physique = clamp(Number(target.physique || 0) + 10);
        target.affection = clamp(Number(target.affection || 0) + 14);
        story.score = 2;
        text = `你守在榻前煎药喂饭，虽然自己熬得疲惫，${target.name}却把这份孝心记在心里。`;
      } else {
        target.physique = clamp(Number(target.physique || 0) - 8);
        target.affection = clamp(Number(target.affection || 0) - 5);
        story.score = 0;
        text = `你让${target.name}先在家静养，省下了医药钱，心里却始终悬着。`;
      }
      story.stage = "followup";
      story.dueYear = state.year + 1;
    } else if (story.type === "siblingDivision") {
      if (effect === "mediate") {
        changeStat("money", -60, deltas);
        changeStat("eq", 2, deltas);
        target.affection = clamp(Number(target.affection || 0) + 6);
        story.score = 2;
        text = `你请族老作证，把田契、器物与奉养父母的责任逐项写清。`;
      } else if (effect === "support") {
        changeStat("money", -120, deltas);
        changeStat("relationship", 3, deltas);
        target.affection = clamp(Number(target.affection || 0) + 14);
        story.score = 3;
        text = `你拿出一笔钱帮${target.name}置办新家，手足间虽分门户，情分反而更厚。`;
      } else {
        target.affection = clamp(Number(target.affection || 0) - 10);
        changeStat("relationship", -2, deltas);
        story.score = 0;
        text = `你劝${target.name}暂缓分家。人是留下了，饭桌上的话却少了。`;
      }
      story.stage = "followup";
      story.dueYear = state.year + 1;
    } else {
      target.educationPath = effect;
      if (effect === "academy") {
        changeStat("money", -160, deltas);
        target.study = clamp(Number(target.study || 0) + 18);
        target.aptitude = clamp(Number(target.aptitude || 0) + 3);
        story.score = 3;
        text = `你将${target.name}送进书院，从描红、背书到习文，一样样扎下根基。`;
      } else if (effect === "craft") {
        changeStat("money", -80, deltas);
        target.study = clamp(Number(target.study || 0) + 8);
        target.virtue = clamp(Number(target.virtue || 0) + 4);
        story.score = 2;
        text = `你替${target.name}寻了一位性情端正的师傅，先学规矩，再学吃饭的本事。`;
      } else {
        target.study = clamp(Number(target.study || 0) + Math.max(4, Math.floor(state.stats.knowledge / 12)));
        target.virtue = clamp(Number(target.virtue || 0) + 8);
        target.affection = clamp(Number(target.affection || 0) + 8);
        story.score = state.stats.knowledge >= 65 ? 2 : 1;
        text = `你把${target.name}留在身边，日日教字、讲理，也让孩子多看家中人情冷暖。`;
      }
      story.stage = "followup";
      story.dueYear = state.year + 2;
    }
  }

  state.lastDeltas = deltas;
  addLog(title, text, deltas);
  state.currentEvent = null;
  state.eventResult = { title, text, deltas, icon: resultIcon(choice, event) };
  unlockLifeGoals();
  save();
  render();
}

function finishFamilyStoryOutcome(story, target, deltas) {
  if (story.type === "parentIllness") {
    const recovered = story.score >= 2 || Number(target.physique || 0) >= 58;
    if (recovered) {
      target.physique = clamp(Number(target.physique || 0) + 10);
      target.chronicIllness = false;
      changeStat("mood", 5, deltas);
      changeStat("relationship", 3, deltas);
      return { title: "病体渐安", text: `${target.name}终于能下床走动。经这一场病，家人更知道彼此可贵。` };
    }
    target.physique = clamp(Number(target.physique || 0) - 10);
    target.chronicIllness = true;
    changeStat("mood", -5, deltas);
    return { title: "旧疾缠身", text: `${target.name}的病没有痊愈，从此遇到寒暑都要格外调养。` };
  }
  if (story.type === "siblingDivision") {
    if (story.score >= 2) {
      target.householdSeparated = true;
      changeStat("relationship", 3, deltas);
      return { title: "分门不分心", text: `${target.name}的新家已经安稳，逢年过节仍常回来走动，手足之间并未因分家疏远。` };
    }
    target.householdSeparated = false;
    target.affection = clamp(Number(target.affection || 0) - 8);
    changeStat("mood", -3, deltas);
    return { title: "同檐生隙", text: `${target.name}仍住在家中，却开始另起炉灶、少问家事，亲近里多了一层隔阂。` };
  }
  const path = story.choice || target.educationPath || "home";
  if (path === "academy") {
    const gain = 10 + Math.round(Number(target.aptitude || 0) / 12);
    target.study = clamp(Number(target.study || 0) + gain);
    target.educationOutcome = target.study >= 65 ? "书院出众" : "书院稳进";
    return { title: "书声渐成", text: `${target.name}已经能独立读文作答，先生说只要不懈怠，日后可望应试。` };
  }
  if (path === "craft") {
    target.study = clamp(Number(target.study || 0) + 6);
    target.virtue = clamp(Number(target.virtue || 0) + 8);
    target.educationOutcome = "手艺入门";
    return { title: "手艺入门", text: `${target.name}跟着师傅跑前跑后，已经能独自做些小活，也更懂得持家辛苦。` };
  }
  target.study = clamp(Number(target.study || 0) + 8);
  target.virtue = clamp(Number(target.virtue || 0) + 10);
  target.affection = clamp(Number(target.affection || 0) + 6);
  target.educationOutcome = "家学有成";
  return { title: "家学有成", text: `${target.name}未入远门，却从你的言传身教里学会读书、做人和照看家人。` };
}

function completeFamilyStory(story) {
  state.familyStories = normalizeFamilyStories(state.familyStories);
  if (story?.key && !state.familyStories.completed.includes(story.key)) state.familyStories.completed.push(story.key);
  state.familyStories.completed = state.familyStories.completed.slice(-30);
  state.familyStories.active = null;
}

function familyStoryStatus(person) {
  const active = state.familyStories?.active;
  const target = familyStoryTarget(active);
  if (target === person && active?.type === "parentIllness") return " · 调养中";
  if (target === person && active?.type === "siblingDivision") return " · 商议分家中";
  if (target === person && active?.type === "childEducation") return " · 教养规划中";
  if (person.chronicIllness) return " · 久病需调养";
  if (person.householdSeparated) return " · 已分家另居";
  return "";
}

function childEducationLabel(child) {
  const labels = { academy: "书院求学", craft: "拜师学艺", home: "家中教养" };
  return child.educationOutcome || labels[child.educationPath] || "";
}

function advanceFamilyYear(deltas) {
  for (const parent of [state.family.father, state.family.mother]) advanceRelationYear(parent, deltas, "parent");
  for (const sibling of state.family.siblings || []) advanceRelationYear(sibling, deltas, "sibling");
  if (state.family.spouseMeta) advanceRelationYear(state.family.spouseMeta, deltas, "spouse");
  archiveDeceasedSpouse(deltas);
  if (state.family.loverMeta) advanceRelationYear(state.family.loverMeta, deltas, "lover");
  for (const concubine of state.family.concubines || []) advanceRelationYear(concubine, deltas, "spouse");
  if (state.family.concubineCandidate) advanceRelationYear(state.family.concubineCandidate, deltas, "lover");
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
    if (child.spouse) advanceRelationYear(child.spouse, deltas, "spouse");
    for (const grandchild of child.grandchildren || []) advanceGrandchildYear(grandchild, deltas);
    if (child.spouse && child.spouse.alive !== false && child.age >= CHILD_MARRIAGE_AGE && child.age <= 50 && child.spouse.age >= CHILD_MARRIAGE_AGE && child.spouse.age <= 50 && (child.grandchildren || []).filter((item) => item.alive !== false).length < 4 && Math.random() < 0.2) {
      const grandchild = makeGrandchild(child, 0);
      child.grandchildren ||= [];
      child.grandchildren.push(grandchild);
      deltas.push({ label: "添孙", value: grandchild.name });
      changeStat("mood", randInt(3, 9), deltas);
      addLog("添孙之喜", `${child.name}与${child.spouse.name}添了${grandchild.relation}${grandchild.name}，三代同堂又多一声啼哭。`, [{ label: grandchild.relation, value: grandchild.name }]);
    }
  }
  for (const child of state.family.children || []) {
    if (child.alive !== false) continue;
    for (const grandchild of child.grandchildren || []) advanceGrandchildYear(grandchild, deltas);
  }

  const childParent = childbearingPartnerThisYear();
  if (childParent) {
    const child = makeChild(state.name.slice(0, 1), 0);
    child.otherParent = childParent.name;
    state.family.children.push(child);
    changeStat("mood", randInt(4, 12), deltas);
    changeStat("relationship", randInt(3, 8), deltas);
    deltas.push({ label: "添丁", value: child.name });
    addLog("添丁", `${childParent.name}为家中添了${child.relation}${child.name}，乳名未定，眉眼间已有几分${child.trait}。`, [{ label: "子女", value: child.name }]);
  }
}

function advanceGrandchildYear(grandchild, deltas = []) {
  if (!grandchild || grandchild.alive === false) return;
  grandchild.age += 1;
  grandchild.physique = clamp(Number(grandchild.physique ?? 70) - relationPhysiqueDecline(grandchild.age, "child"));
  if (grandchild.physique <= 0) {
    grandchild.alive = false;
    grandchild.physique = 0;
    addLog("孙辈离世", `${grandchild.name}不幸离世，白发人闻讯悲恸。`, [{ label: grandchild.relation, value: "离世", negative: true }]);
    changeStat("mood", -randInt(7, 16), deltas);
  } else if (grandchild.age <= 16) {
    grandchild.study = clamp(grandchild.study + randInt(0, grandchild.aptitude >= 70 ? 4 : 2));
    grandchild.virtue = clamp(grandchild.virtue + randInt(-1, 2));
  }
}

function archiveDeceasedSpouse(deltas = []) {
  const spouse = state.family.spouseMeta;
  if (!state.family.spouse || !spouse || spouse.alive !== false) return;
  state.family.spouseHistory ||= [];
  if (!state.family.spouseHistory.some((item) => item.name === spouse.name)) state.family.spouseHistory.push({ ...spouse, relation: "故配" });
  state.family.spouseHistory = state.family.spouseHistory.slice(-6);
  const name = state.family.spouse;
  state.family.spouse = null;
  state.family.spouseMeta = null;
  state.family.spouseProfile = null;
  state.family.spouseAffection = 0;
  state.family.concubineCandidate = null;
  deltas.push({ label: "婚姻", value: "丧偶", negative: true });
  addLog("丧偶", `${name}离世后，家中收起旧日婚书。服丧过后，你仍可托媒人另寻配偶。`, [{ label: "故配", value: name, negative: true }]);
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
    ...(state.family.concubines || []),
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
    ...(state.family.concubines || []),
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

function annualPartnerEvent(deltas = []) {
  const spouse = state.family.spouse && state.family.spouseMeta?.alive !== false ? state.family.spouseMeta : null;
  const concubines = (state.family.concubines || []).filter((item) => item.alive !== false);
  if ((!spouse && !concubines.length) || Math.random() > 0.28) return;

  if (spouse && concubines.length && Math.random() < 0.42) {
    const concubine = sample(concubines);
    state.family.romanceRecords.conflicts += 1;
    const steady = Number(state.stats.eq || 0) + Number(state.family.spouseAffection || spouse.affection || 0) / 2 + randInt(-20, 20) >= 85;
    if (steady) {
      state.family.spouseAffection = clamp(Number(state.family.spouseAffection || 0) + randInt(1, 4));
      spouse.affection = state.family.spouseAffection;
      concubine.affection = clamp(Number(concubine.affection || 0) + randInt(0, 3));
      changeStat("eq", randInt(1, 3), deltas);
      addLog("内宅调停", `${state.family.spouse}与${concubine.name}因月例和房中安排起了口角。你没有偏听，重新定下规矩，两边总算各退一步。`, [{ label: "内宅", value: "暂归和顺" }]);
    } else {
      state.family.spouseAffection = clamp(Number(state.family.spouseAffection || 0) - randInt(3, 8));
      spouse.affection = state.family.spouseAffection;
      concubine.jealousy = clamp(Number(concubine.jealousy || 0) + randInt(5, 12), 0, 100);
      changeStat("mood", -randInt(2, 6), deltas);
      addLog("内宅生隙", `${state.family.spouse}与${concubine.name}为你近日偏向谁而争执。你处置得不够周全，几日里后院都冷着脸。`, [{ label: "夫妻情分", value: state.family.spouseAffection, negative: true }]);
    }
    return;
  }

  const partner = spouse ? { ...spouse, name: state.family.spouse, spouseProxy: true } : sample(concubines);
  if (!partner) return;
  const roll = Math.random();
  if (roll < 0.38) {
    changeStat("mood", randInt(2, 6), deltas);
    changeStat("relationship", randInt(1, 4), deltas);
    if (partner.spouseProxy) state.family.spouseAffection = clamp(Number(state.family.spouseAffection || 0) + randInt(2, 5));
    else partner.affection = clamp(Number(partner.affection || 0) + randInt(2, 5));
    addLog("枕边夜话", `${partner.name}等你卸下外衣，与你说起家事和近来的心绪。你难得耐心听完，彼此更亲近了。`, [{ label: partner.relation || "姻缘", value: partner.name }]);
  } else if (roll < 0.72) {
    const cost = Math.min(Math.max(0, state.stats.money), randInt(18, 70));
    if (cost) {
      changeStat("money", -cost, deltas);
      addLedger("内宅用度", -cost, `为${partner.name}添置衣物药材。`);
    }
    addLog("内宅照拂", `${partner.name}近日有些劳累，你拨出用度，又让人少派些杂事，家中气氛随之和缓。`, [{ label: "用度", value: cost ? moneyText(-cost, { signed: true }) : "照料" }]);
  } else {
    state.family.intimacyBonus = clamp(Number(state.family.intimacyBonus || 0) + 0.08, 0, 0.45);
    if (partner.spouseProxy) state.family.spouseAffection = clamp(Number(state.family.spouseAffection || 0) + randInt(1, 4));
    else partner.intimacy = clamp(Number(partner.intimacy || 0) + randInt(2, 6));
    addLog("夫妻相伴", `夜深后你留在${partner.name}房中，共叙枕边话，随后同房歇下。晨起时，两人心绪都比往日安稳。`, [{ label: "亲密", value: partner.name }]);
  }
}

function childbearingPartnerThisYear() {
  if (state.prisonYears > 0 || state.age < 16 || state.age > 52) return null;
  if (state.gender === "female" && state.age > 45) return null;
  const partners = [];
  if (state.family.spouse && state.family.spouseMeta?.alive !== false) partners.push({ ...state.family.spouseMeta, name: state.family.spouse, primary: true });
  if (state.gender === "male") partners.push(...(state.family.concubines || []).filter((item) => item.alive !== false));
  if (!partners.length) return null;
  const living = livingChildren();
  if (living.length >= 8) return null;
  const bonus = clamp(Number(state.family.intimacyBonus || 0), 0, 0.45);
  state.family.intimacyBonus = 0;
  const chance = (living.length ? 0.14 : 0.32) + bonus;
  if (Math.random() >= chance) return null;
  const weighted = partners.flatMap((partner) => Array.from({ length: Math.max(1, Math.ceil(Number(partner.affection || 50) / 25)) }, () => partner));
  return sample(weighted) || partners[0];
}

function livingChildren() {
  return (state.family.children || []).filter((child) => child.alive !== false);
}

function livingGrandchildren() {
  return livingChildren().flatMap((child) => (child.grandchildren || []).filter((grandchild) => grandchild.alive !== false).map((grandchild) => ({ ...grandchild, parentId: child.id, parentName: child.name, heirKind: "grandchild" })));
}

function adultChildren() {
  return livingChildren().filter((child) => child.age >= 15);
}

function eligibleHeirs() {
  const spouseHeir = state.gender === "male" && state.family.spouse && state.family.spouseMeta?.alive !== false
    ? [{ ...state.family.spouseMeta, id: "spouse-heir", name: state.family.spouse, relation: "妻子", gender: "female", heirKind: "spouse", study: Number(state.family.spouseMeta.study || 35), virtue: Number(state.family.spouseMeta.virtue || 55), aptitude: Number(state.family.spouseMeta.aptitude || 55) }]
    : [];
  const order = { spouse: 0, child: 1, grandchild: 2 };
  return [
    ...spouseHeir,
    ...livingChildren().map((child) => ({ ...child, heirKind: "child" })),
    ...livingGrandchildren(),
  ].sort((a, b) => order[a.heirKind] - order[b.heirKind] || b.age - a.age || (b.aptitude + b.study + b.virtue) - (a.aptitude + a.study + a.virtue));
}

function eventKey(event) {
  if (!event) return "";
  return String(event.id || event.title || event.kind || "").trim();
}

function rememberEventKey(event) {
  const key = eventKey(event);
  if (!key) return;
  state.recentEventKeys = [key, ...((state.recentEventKeys || []).filter((item) => item !== key))].slice(0, 18);
}

function hardConditionsPass(conditions = []) {
  // 建池时不掷概率：GetProbability 只决定稀有度，不应把大半事件直接踢出候选池
  return conditionsPass(conditions, { ignoreProbability: true });
}

function eventEligible(event, age = state.age) {
  if (!event) return false;
  if (event.minAge != null && age < event.minAge) return false;
  if (event.maxAge != null && age > event.maxAge) return false;
  if (event.bucket && !bucketMatchesAge(event.bucket, age)) return false;
  if (event.category === "male" && state.gender !== "male") return false;
  if (event.category === "female" && state.gender !== "female") return false;
  return hardConditionsPass(event.conditions || []);
}

function weightedSample(list, weightFn = () => 1) {
  if (!list?.length) return undefined;
  let total = 0;
  const weights = list.map((item) => {
    const weight = Math.max(0, Number(weightFn(item)) || 0);
    total += weight;
    return weight;
  });
  if (total <= 0) return sample(list);
  let roll = Math.random() * total;
  for (let i = 0; i < list.length; i += 1) {
    roll -= weights[i];
    if (roll <= 0) return list[i];
  }
  return list[list.length - 1];
}

function eventProbabilityWeight(event) {
  // 若事件自身带概率条件，保留“更难得”的差异，但不至于抽空
  let weight = 1;
  for (const cond of event.conditions || []) {
    if ((cond.name || "") !== "GetProbability") continue;
    const value = conditionNumber(cond.para);
    if (!Number.isFinite(value)) continue;
    const chance = value > 1 ? value / 100 : value;
    weight *= clamp(chance, 0.08, 1);
  }
  return weight;
}

function pickYearEventFromPool(pool) {
  if (!pool?.length) return null;
  const recent = new Set(state.recentEventKeys || []);
  const fresh = pool.filter((event) => !recent.has(eventKey(event)));
  const preferred = fresh.length ? fresh : pool;
  // 近期未出现的权重更高
  const picked = weightedSample(preferred, (event) => {
    const base = eventProbabilityWeight(event);
    return recent.has(eventKey(event)) ? base * 0.15 : base;
  });
  return picked || sample(preferred) || sample(pool) || null;
}

function chooseEvent() {
  const age = state.age;
  const expanded = expandedDailyEvents().filter((event) => eventEligible(event, age));
  const fromData = (DATA.randomEvents || []).filter((event) => eventEligible(event, age));

  // 以随机事件库为主，补充日常短剧；再压低“刚抽过”的权重
  const pool = [];
  for (const event of fromData) pool.push(event);
  for (const event of expanded) pool.push(event);

  // 兼容：库被条件滤空时，至少还能从扩展日常里出剧情
  const source = pool.length ? pool : expanded.length ? expanded : fromData;
  if (!source.length) return null;

  // 约 28% 优先抽扩展日常（原先 58% 过高，中年后容易循环那十来个标题）
  if (expanded.length && Math.random() < 0.28) {
    const daily = pickYearEventFromPool(expanded);
    if (daily) {
      rememberEventKey(daily);
      return cloneEvent(daily);
    }
  }

  const picked = pickYearEventFromPool(source);
  if (picked) rememberEventKey(picked);
  return cloneEvent(picked);
}

function expandedDailyEvents() {
  return EXPANDED_DAILY_EVENT_DEFS.map(([minAge, maxAge, title, content, choices], index) => ({
    kind: "dailyStory",
    id: `expanded-daily-${index}`,
    minAge,
    maxAge,
    title,
    content,
    children: choices.map(([choiceTitle, choiceContent, effects]) => ({ title: choiceTitle, content: choiceContent, effects, conditions: [], children: [] })),
  }));
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
  if (!choice || choice.disabled) return;
  // 点击时不再重掷 GetProbability，避免“选项显示了却点不动”
  if (!conditionsPass(choice.conditions || [], { ignoreProbability: true })) return;

  try {
    if (event.kind === "officialCase") return resolveOfficialCase(event, choice);
    if (event.kind === "familyStory") return resolveFamilyStory(event, choice);
    if (event.kind === "careerCase") return resolveCareerCase(event, choice);
    if (event.kind === "fortuneEvent") return resolveFortuneEvent(event, choice);
    if (event.kind === "dailyStory") return resolveDailyStory(event, choice);
    if (event.kind === "examinerBribe") return resolveExaminerBribe(choice);
    if (event.kind === "underworldConsequence") return resolveUnderworldConsequence(event, choice);
    if (event.kind === "jianghuProphecy") return resolveJianghuProphecy(event, choice);
    if (event.kind === "secretIntroduction") return resolveSecretIntroduction(event, choice);
    if (event.kind === "prisonYear") return resolvePrisonYear(event, choice);
    if (event.kind === "culturalEvent") return resolveCulturalEvent(event, choice);
    if (event.kind === "worldArc") return resolveWorldArcEvent(event, choice);

    const deltas = applyResults(choice.results || []);
    state.lastDeltas = mergeDeltas(state.pendingActivity?.deltas, deltas);
    const resultText = fillPlaceholders(choice.content || choice.history || choice.title);
    addLog(choice.title || event.title || "事件", resultText, deltas);
    // 嵌套子事件：若后续分支条件全部不成立，直接结算，避免卡死
    const nextChildren = viableChildren(choice);
    const nested = nextChildren.length && !state.dead ? { ...choice, kind: event.kind || choice.kind || "" } : null;
    state.currentEvent = nested;
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
  } catch (error) {
    console.error("chooseOption failed", error);
    state.currentEvent = null;
    state.eventResult = {
      title: choice?.title || event?.title || "事件中断",
      text: "此事中途出了差错，你只好草草收场，日子还得往下过。",
      deltas: state.lastDeltas || [],
      icon: "MainBook",
    };
    save();
    render();
  }
}

function resolveDailyStory(event, choice) {
  const deltas = [];
  for (const [stat, amount] of Object.entries(choice.effects || {})) changeStat(stat, amount, deltas);
  state.currentEvent = null;
  state.lastDeltas = deltas;
  addLog(`日常 · ${event.title}`, choice.content, deltas);
  state.eventResult = { title: choice.title, text: choice.content, deltas, icon: resultIcon(choice, event), scene: dailySceneFor(event) };
  save();
  render();
}

function dailySceneFor(event) {
  const text = `${event?.title || ""}${event?.content || ""}`;
  if (/雨|河|桥|水/.test(text)) return "travel";
  if (/灯|宴|酒|故友/.test(text)) return "lantern";
  if (/书|私塾|族谱|旧匣/.test(text)) return "ink";
  if (/火|险|榜文/.test(text)) return "ember";
  return "petal";
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
  if (!state.dead && state.pendingAnnualEvent) {
    state.currentEvent = state.pendingAnnualEvent;
    state.pendingAnnualEvent = null;
  }
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
      imposePrisonSentence(years, "事件获罪");
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
  state.pendingAnnualEvent = null;
  state.pendingCaravan = null;
  addLog("身后事", `${state.name}于${state.age}岁${reason}。`);
  unlockLifeGoals();
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
  if (state.career) return finishAction("须先辞职", `你现在仍在${currentCareerName()}任职。若要改换营生，须先在当前职业操作中正式辞去这份差事。`, [{ label: "转职", value: "尚未辞职", negative: true }], "Career");
  if (careerLockedReason(career)) return;
  state.career = career;
  careerProgressFor(career.name);
  if (careerKind(career) === "official") {
    state.official.unlocked = true;
    state.official.retired = false;
    state.official.rank = Math.max(officialRankIndex(), hasPalaceAppointment() ? 1 : 0);
    ensureOfficialNetwork();
    recordOfficialPost("入仕");
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

function careerProgressFor(name = state.career?.name) {
  if (!name) return { exp: 0, level: 1, records: { cases: 0, successes: 0 } };
  state.careerProgress ||= {};
  const source = state.careerProgress[name] && typeof state.careerProgress[name] === "object" ? state.careerProgress[name] : {};
  source.exp = Math.max(0, Number(source.exp) || 0);
  source.level = Math.max(1, Math.round(Number(source.level) || 1));
  source.records = {
    cases: Math.max(0, Math.round(Number(source.records?.cases) || 0)),
    successes: Math.max(0, Math.round(Number(source.records?.successes) || 0)),
  };
  state.careerProgress[name] = source;
  return source;
}

function careerSkillKeys(career = state.career) {
  const name = career?.name || "";
  return CAREER_SKILL_OVERRIDES[name] || CAREER_KIND_SKILLS[careerKind(career)] || CAREER_KIND_SKILLS.common;
}

function careerAdvancedCase(name = state.career?.name) {
  if (CAREER_ADVANCED_CASE_DEFS[name]) return CAREER_ADVANCED_CASE_DEFS[name];
  const career = state.career?.name === name ? state.career : allCareers().find((item) => item.name === name);
  if (!career) return null;
  const template = CAREER_KIND_ADVANCED_CASES[careerKind(career)] || CAREER_KIND_ADVANCED_CASES.common;
  const [title, prompt, choices] = template;
  return {
    title: `${name} · ${title}`,
    prompt: `你以${name}身份遇到一桩难事：${prompt}`,
    choices: choices.map(([label, note, text]) => [label, note, `${text} 此事也让旁人重新衡量你在${name}一业中的本事与为人。`]),
  };
}

function careerActions() {
  const kind = careerKind();
  const careerName = state.career?.name || "";
  if (kind === "official") return officialCareerActions();
  const maps = {
    caravan: [
      ["route:county", "近郊短镖", "低风险短线，收益稳当。"],
      ["route:merchant", "云州商路", "中等风险，收益更高。"],
      ["route:frontier", "边关重镖", "高风险高收益，可能受伤。"],
      ["route:night", "夜走险货", "极高风险，来钱最快，也最危险。"],
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
  const actions = (CAREER_ACTION_OVERRIDES[careerName] || maps[kind] || maps.common).map((item) => [...item]);
  const advanced = careerAdvancedCase(careerName);
  if (advanced) {
    const level = careerProgressFor(careerName).level;
    actions.push(["story:advanced", advanced.title, `${level >= 3 ? "名家委托" : "本业专案"} · 进入带检定与不同结果的职业剧情。`]);
  }
  actions.push(["resign", "辞去营生", `正式离开${currentCareerName()}；辞职完成后才可选择其他职业。`]);
  return actions;
}

function performCareerAction(type) {
  if (!state.career || state.dead || state.currentEvent || state.eventResult || state.pendingCaravan || state.prisonYears > 0 || state.age < 15) return;
  if (type === "resign") return resignCareer();
  const kind = careerKind();
  if (String(type || "").startsWith("story:")) return startCareerCase();
  if (kind === "caravan") return performCaravanRoute(String(type || "").replace("route:", "") || "county");
  if (kind === "official") return performOfficialAction(type);
  const deltas = [];
  const progress = careerProgressFor();
  let title = state.career.name;
  let text = "";
  const levelBonus = Math.max(0, Number(progress.level) || 1);
  {
    const risky = type === "risk" || type === "masterwork";
    const [primary, secondary] = careerSkillKeys();
    const skillScore = Number(state.stats[primary] || 0) * 0.68 + Number(state.stats[secondary] || 0) * 0.32;
    const success = !risky || Math.random() + (skillScore + levelBonus * 5) / 260 > 0.62;
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
  const levelUpText = addCareerExperience(progress, randInt(8, type === "routine" ? 18 : 32), deltas);
  if (levelUpText) text += levelUpText;
  text += careerIncident(kind, type, deltas, progress);
  addLedger(title, deltas.filter((delta) => delta.stat === "money").reduce((sum, delta) => sum + Number(delta.value || 0), 0), text);
  unlockLifeGoals();
  finishAction(title, text, deltas, careerIcon(kind));
}

function resignCareer() {
  if (!state.career || state.dead || state.currentEvent || state.pendingCaravan || state.prisonYears > 0) return;
  const career = state.career;
  const name = currentCareerName();
  const kind = careerKind(career);
  const progress = careerProgressFor(career.name);
  const deltas = [];
  changeStat("mood", kind === "official" ? -3 : 1, deltas);
  if (kind === "official") {
    state.official.retired = true;
    recordOfficialPost("辞官");
    changeStat("favorability", -2, deltas);
  }
  state.careerHistory ||= [];
  state.careerHistory.push({ name: career.name, displayName: name, kind, year: state.year, level: progress.level, reason: kind === "official" ? "辞官" : "辞职" });
  state.careerHistory = state.careerHistory.slice(-20);
  state.career = null;
  finishAction(kind === "official" ? "辞官归身" : "辞去营生", `你向${kind === "official" ? "朝廷递上辞呈，交清印信案卷" : "东家与同行交清账目、工具和未完差事"}，正式离开${name}。旧日技艺经验仍会保留，此后可在营生页另择职业。`, deltas, kind === "official" ? "Official" : "CashBox");
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
  if (!story || Math.random() > 0.5) return "";
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

function addCareerExperience(progress, amount, deltas = []) {
  progress.exp = Math.max(0, Number(progress.exp || 0) + Math.max(0, Number(amount) || 0));
  let levels = 0;
  while (progress.exp >= progress.level * 80 && levels < 10) {
    progress.exp -= progress.level * 80;
    progress.level += 1;
    levels += 1;
  }
  if (!levels) return "";
  deltas.push({ label: "技艺", value: `${progress.level}级` });
  return ` 你的本业技艺升至 ${progress.level} 级。`;
}

function careerCaseToEvent(item, careerName = state.career?.name) {
  if (!item || !careerName) return null;
  const career = state.career?.name === careerName ? state.career : allCareers().find((candidate) => candidate.name === careerName) || { name: careerName };
  const [primary, secondary] = careerSkillKeys(career);
  const profiles = [
    { stat: secondary, support: primary, difficulty: 58, profile: "steady" },
    { stat: primary, support: secondary, difficulty: 78, profile: "bold" },
    { stat: "eq", support: "virtue", difficulty: 65, profile: "humane" },
  ];
  return {
    kind: "careerCase",
    id: `career-case-${careerName}`,
    careerName,
    title: `${careerName} · ${item.title}`,
    content: item.prompt,
    icon: careerIcon(careerKind()),
    children: item.choices.map(([label, note, text], index) => ({
      title: label,
      note: `${note} · 主看${STAT_LABELS[profiles[index].stat] || profiles[index].stat}`,
      text,
      ...profiles[index],
      children: [],
      conditions: [],
      results: [],
    })),
  };
}

function startCareerCase() {
  const item = careerAdvancedCase();
  if (!item || !state.career) return;
  state.currentEvent = careerCaseToEvent(item, state.career.name);
  save();
  render();
}

function resolveCareerCase(event, choice) {
  if (!state.career || event.careerName !== state.career.name) {
    state.currentEvent = null;
    return finishAction("委托已失效", "你已经改换营生，这桩旧日委托只得作罢。", [], "Career");
  }
  const deltas = [];
  const progress = careerProgressFor();
  const level = Math.max(1, Number(progress.level) || 1);
  const focus = Number(state.stats[choice.stat] || 0);
  const support = Number(state.stats[choice.support] || 0);
  const roll = randInt(1, 100) + Math.floor(focus / 5) + Math.floor(support / 10) + level * 3;
  const success = roll >= Number(choice.difficulty || 65);
  const profile = choice.profile || "steady";
  const moneyRanges = {
    steady: success ? [65, 135] : [-30, 20],
    bold: success ? [145, 285] : [-120, -35],
    humane: success ? [35, 95] : [-15, 25],
  };
  const experienceRanges = { steady: [18, 30], bold: [26, 42], humane: [16, 28] };
  let money = rangeValue(moneyRanges[profile] || moneyRanges.steady);
  if (success) money += level * (profile === "bold" ? 18 : 10);
  changeStat("money", money, deltas);
  changeStat(choice.stat, success ? randInt(1, 4) : randInt(0, 2), deltas);
  if (profile === "steady") changeStat("favorability", success ? randInt(1, 4) : 0, deltas);
  if (profile === "bold") {
    changeStat("mood", success ? randInt(3, 8) : -randInt(3, 9), deltas);
    if (!success) changeStat("physique", -randInt(1, 6), deltas);
    if (success) changeStat("favorability", randInt(2, 6), deltas);
  }
  if (profile === "humane") {
    changeStat("relationship", success ? randInt(3, 8) : randInt(0, 3), deltas);
    changeStat("virtue", success ? randInt(1, 5) : 0, deltas);
  }
  const levelText = addCareerExperience(progress, rangeValue(experienceRanges[profile] || experienceRanges.steady), deltas);
  progress.records.cases += 1;
  if (success) progress.records.successes += 1;
  const resultText = success
    ? `${choice.text} 事情收得漂亮，你在${state.career.name}一业的名声又稳了一层。${levelText}`
    : `${choice.text} 可惜临场处置未尽如人意，你赔了些本钱，也记下这次教训。${levelText}`;
  state.currentEvent = null;
  state.eventResult = { title: `${event.title} · ${success ? "办妥" : "失手"}`, text: resultText, deltas, icon: event.icon || careerIcon(careerKind()) };
  state.lastDeltas = deltas;
  addLedger(`${state.career.name}专案`, deltas.filter((delta) => delta.stat === "money").reduce((sum, delta) => sum + Number(delta.value || 0), 0), resultText);
  addLog(event.title || `${state.career.name}专案`, resultText, deltas);
  unlockLifeGoals();
  save();
  render();
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
  const worldRisk = state.dynasty ? Math.round((state.dynasty.borderThreat + Math.max(0, 60 - state.dynasty.local.security)) / 12) : 0;
  return Math.max(4, Math.round(route.risk + worldRisk - Math.max(1, level) * 3 - ability));
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
  tryUnlockTravelLandmarks(shuffle(["caravan-mountain", "caravan-desert", "caravan-river"]).slice(0, summary.success ? 2 : 1), deltas, summary.success ? 0.85 : 0.55);
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

function careerPracticeSummary(progress = careerProgressFor()) {
  if (!state.career || !careerAdvancedCase()) return "";
  const [primary, secondary] = careerSkillKeys();
  const records = progress.records || { cases: 0, successes: 0 };
  return `
      ${infoLine("专长", `${STAT_LABELS[primary]} ${Math.round(state.stats[primary] || 0)} · ${STAT_LABELS[secondary]} ${Math.round(state.stats[secondary] || 0)}`)}
      ${infoLine("专案", `${records.cases || 0} 件 · 办妥 ${records.successes || 0} 件`)}`;
}

function normalizePartner(person, familyName = "李", relation = "配偶", fallbackId = "partner") {
  const base = normalizeRelative({ relation, alive: true, ...person }, familyName, "partner");
  return {
    ...base,
    id: person?.id || `${fallbackId}-${base.name}`,
    relation,
    intimacy: clamp(Number(person?.intimacy ?? 35)),
    jealousy: clamp(Number(person?.jealousy ?? 0), 0, 100),
    lastIntimateYear: Number.isFinite(Number(person?.lastIntimateYear)) ? Number(person.lastIntimateYear) : -1,
  };
}

function currentCareerName() {
  if (!state.career) return "";
  return careerKind(state.career) === "official" ? officialTitle() : state.career.name;
}

function officialCareerSummary() {
  const office = officialOffice();
  const need = nextOfficialMeritNeed();
  const tendency = officialTendencyMeta();
  const network = ensureOfficialNetwork();
  const reviewText = Number(state.official.reviewLockUntil || 0) > Number(state.year || state.age)
    ? `考课暂缓至 ${Math.round(state.official.reviewLockUntil)} 岁后`
    : need ? `距 ${nextOfficialTitle()} 还差 ${need}` : "位极人臣";
  return `
      ${infoLine("官职", `${office.grade} · ${office.office}`)}
      ${infoLine("辖务", `${office.scope} · ${office.duty}`)}
      ${infoLine("官评", `${Math.round(state.official.merit || 0)} 政绩 · ${reviewText}`)}
      ${infoLine("路线", `${tendency.label} · 清名 ${Math.round(state.official.clean || 0)} · 浊名 ${Math.round(state.official.corruption || 0)}`)}
      ${state.official.postHistory?.length ? infoLine("履历", state.official.postHistory.slice(-3).reverse().map((item) => `${item.year}岁 ${officialOffice(item.rank).office}`).join(" → ")) : ""}
      <div class="official-network">
        ${network.slice(0, 5).map((item) => `
          <span class="${item.affection < 0 ? "bad" : item.affection >= 65 ? "good" : ""}">
            <b>${escapeHtml(item.relation)}</b>${escapeHtml(item.name)} · ${escapeHtml(item.faction)} · ${Math.round(item.affection)}
          </span>`).join("")}
      </div>
      <p class="official-note">${escapeHtml(tendency.note)}</p>`;
}

function annualAssetIncome() {
  return (state.assets || []).reduce((sum, item) => {
    const condition = clamp(Number(item.condition ?? 72), 20, 120) / 100;
    const level = Math.max(1, Number(item.level) || 1);
    const modeFactor = item.mode === "self" ? 1.18 : 0.92;
    const worldFactor = state.dynasty ? clamp(0.72 + state.dynasty.prosperity / 190 + state.dynasty.local.sentiment / 500 - state.dynasty.local.disaster / 240, 0.52, 1.42) : 1;
    const grainFactor = /田|庄|农/.test(item.name || item.label || "") && state.dynasty ? clamp(state.dynasty.local.grainPrice / 100, 0.7, 1.55) : 1;
    return sum + Math.round(Number(item.income || 0) * level * modeFactor * condition * worldFactor * grainFactor * (0.75 + Math.random() * 0.5));
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
  if (!dest) return;
  state.travelSystem = normalizeTravelSystem(state.travelSystem);
  state.travelSystem.selectedDestination = dest.id;
  save();
  render();
}

function travelDestinationById(id = state.travelSystem?.selectedDestination) {
  return TRAVEL_DESTINATIONS.find((item) => item.id === id) || TRAVEL_DESTINATIONS[0];
}

function travelCarriage() {
  return TRAVEL_CARRIAGES[clamp(Math.round(Number(state.travelSystem?.carriageLevel) || 1), 1, TRAVEL_CARRIAGES.length) - 1];
}

function travelSupply() {
  return TRAVEL_SUPPLIES.find((item) => item.id === state.travelSystem?.supplyId) || TRAVEL_SUPPLIES[1];
}

function travelCompanions() {
  const companions = [{ id: "alone", name: "独自上路", relation: "独行", bonus: 2, note: "行止自由，途中更容易静心看风景。" }];
  if (state.family.spouse && state.family.spouseMeta?.alive !== false) companions.push({ id: "spouse", name: state.family.spouse, relation: state.gender === "male" ? "妻子" : "夫君", bonus: 8, note: "夫妻同游，增进亲密，也能相互照应。" });
  const friend = state.friends.filter((item) => item.alive !== false).sort((a, b) => Number(b.affection || 0) - Number(a.affection || 0))[0];
  if (friend) companions.push({ id: friend.id, name: friend.name, relation: "友人", bonus: 6, note: "与知己同行，路上见闻有人分享。" });
  const child = adultChildren().sort((a, b) => Number(b.affection || 0) - Number(a.affection || 0))[0];
  if (child) companions.push({ id: child.id, name: child.name, relation: child.relation, bonus: 5, note: "带成年子女远行，也是一场家学与历练。" });
  return companions;
}

function selectTravelCompanion(id) {
  const companion = travelCompanions().find((item) => item.id === id);
  if (!companion || state.pendingTravel) return;
  state.travelSystem.companionId = companion.id;
  save();
  render();
}

function selectTravelSupply(id) {
  if (!TRAVEL_SUPPLIES.some((item) => item.id === id) || state.pendingTravel) return;
  state.travelSystem.supplyId = id;
  save();
  render();
}

function travelTripCost(destination = travelDestinationById()) {
  const supply = travelSupply();
  const memory = state.travelSystem.memories?.[destination.id] || { trips: 0 };
  const discount = Math.min(0.24, Number(memory.trips || 0) * 0.04);
  const worldSurcharge = state.dynasty ? Math.max(0, Math.round((state.dynasty.local.grainPrice - 100) / 16 + (55 - state.dynasty.local.security) / 18)) : 0;
  return Math.max(4, Math.round(destination.cost * (1 - discount)) + supply.cost + worldSurcharge);
}

function startTravelJourney() {
  if (!state || state.dead || state.age < 6 || state.prisonYears > 0 || state.pendingTravel || state.pendingCaravan) return;
  state.travelSystem = normalizeTravelSystem(state.travelSystem);
  const destination = travelDestinationById();
  const companion = travelCompanions().find((item) => item.id === state.travelSystem.companionId) || travelCompanions()[0];
  const supply = travelSupply();
  const carriage = travelCarriage();
  const cost = travelTripCost(destination);
  if (state.stats.money < cost) return finishAction("路资不足", `前往${destination.name}并备下${supply.name}共需 ${moneyText(cost)}。`, [{ label: "钱财", value: "不足", negative: true }], "CashBox");
  const eventCount = clamp(Math.ceil(destination.days / 2), 1, 3);
  const events = pickMany(TRAVEL_ROUTE_EVENTS, eventCount).map((item) => item.id);
  const deltas = [];
  changeStat("money", -cost, deltas);
  addLedger("远游路资", -cost, `乘${carriage.name}由${state.location}前往${destination.name}，行囊为${supply.name}。`);
  state.pendingTravel = normalizeTravelRun({
    id: `travel-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    destinationId: destination.id,
    origin: state.location,
    index: 0,
    events,
    companionId: companion.id,
    companionName: companion.name,
    supplyId: supply.id,
    quality: clamp(52 + carriage.comfort + supply.comfort + companion.bonus - (state.dynasty ? Math.round((state.dynasty.borderThreat + state.dynasty.local.disaster) / 24) : 0)),
    spent: cost,
    history: [{ title: "启程", text: `你与${companion.name}乘${carriage.name}启程，向${destination.name}而去。`, ok: true }],
  });
  state.lastDeltas = deltas;
  save();
  render();
}

function travelEventById(id) {
  return TRAVEL_ROUTE_EVENTS.find((item) => item.id === id) || TRAVEL_ROUTE_EVENTS[0];
}

function resolveTravelChoice(index) {
  const run = normalizeTravelRun(state.pendingTravel);
  if (!run || run.index >= run.events.length) return;
  const event = travelEventById(run.events[run.index]);
  const choice = event.choices[Number(index)];
  if (!choice) return;
  const [label, stat, difficulty, successText, failText, successEffects, failEffects, qualityGain] = choice;
  const supply = TRAVEL_SUPPLIES.find((item) => item.id === run.supplyId) || TRAVEL_SUPPLIES[1];
  const carriage = travelCarriage();
  const memory = state.travelSystem.memories?.[run.destinationId] || { trips: 0 };
  const companion = travelCompanions().find((item) => item.id === run.companionId) || { bonus: 0 };
  const score = randInt(1, 100) + Math.floor(Number(state.stats[stat] || 50) / 5) + supply.safety + carriage.safety + companion.bonus + Math.min(12, Number(memory.trips || 0) * 3) - (state.travelSystem.condition < 40 ? 10 : 0);
  const success = score >= Number(difficulty || 45);
  const effects = success ? successEffects : failEffects;
  const deltas = [];
  for (const [key, value] of Object.entries(effects || {})) changeStat(key, value, deltas);
  run.quality = clamp(run.quality + (success ? qualityGain : -Math.max(3, Math.round(qualityGain / 2))));
  run.history.push({ title: `${event.title} · ${label}`, text: success ? successText : failText, ok: success });
  run.index += 1;
  state.travelSystem.condition = clamp(state.travelSystem.condition - randInt(success ? 2 : 5, success ? 5 : 10));
  state.pendingTravel = run;
  state.lastDeltas = deltas;
  save();
  render();
}

function completeTravelActivity(activityId) {
  const run = normalizeTravelRun(state.pendingTravel);
  if (!run || run.index < run.events.length) return;
  const destination = travelDestinationById(run.destinationId);
  const deltas = [];
  let title = "游历";
  let text = "";
  if (activityId === "landmark") {
    changeStat(destination.stat, randInt(3, 7), deltas);
    changeStat("mood", randInt(3, 7), deltas);
    title = `游览${destination.landmark}`;
    text = `${destination.story}你在${destination.landmark}停留半日，把沿途所见细细记在心里。`;
  } else if (activityId === "souvenir") {
    const cost = 30;
    if (state.stats.money < cost) return;
    changeStat("money", -cost, deltas);
    changeStat("looks", randInt(1, 3), deltas);
    addInventoryItem(destination.souvenir, deltas);
    title = "采买风物";
    text = `你在${destination.name}的市集挑中${destination.souvenir}，也尝过几样当地吃食。`;
  } else {
    changeStat("relationship", randInt(4, 8), deltas);
    changeStat("eq", randInt(2, 5), deltas);
    if (Math.random() < 0.45) addFriend();
    title = "拜访当地人";
    text = `你在${destination.name}随席听谈，与当地人聊起风土、行当与远方消息。`;
  }
  const target = run.companionId !== "alone" ? findRelationTarget(run.companionId) : null;
  if (target?.person) {
    target.person.affection = clamp(Number(target.person.affection || 60) + randInt(3, 7));
    text += ` ${run.companionName}一路与你同看风景，彼此更亲近了。`;
  }
  const memory = state.travelSystem.memories[destination.id] ||= { trips: 0, bestQuality: 0, lastCompanion: "", lastActivity: "" };
  memory.trips += 1;
  memory.bestQuality = Math.max(Number(memory.bestQuality || 0), run.quality);
  memory.lastCompanion = run.companionName;
  memory.lastActivity = title;
  state.travelSystem.totalTrips += 1;
  if (!state.travelSystem.stamps.includes(destination.id)) state.travelSystem.stamps.push(destination.id);
  tryUnlockTravelLandmarks(destination.landmarks || [], deltas, 0.9);
  if (activityId === "landmark") tryUnlockTravelLandmarks(["study-tour"], deltas, 0.35);
  state.location = destination.name;
  const routeStory = run.history.map((item) => item.text).join(" ");
  state.pendingTravel = null;
  finishAction(`${destination.name} · ${title}`, `${routeStory} 抵达后，${text} 本次旅途评定为 ${travelQualityLabel(run.quality)}（${Math.round(run.quality)}）。`, deltas, destination.icon || "RepairCarriage");
}

function travelQualityLabel(value) {
  if (value >= 82) return "尽兴难忘";
  if (value >= 65) return "一路顺遂";
  if (value >= 45) return "有惊无险";
  return "舟车劳顿";
}

function upgradeTravelCarriage(action) {
  if (state.pendingTravel) return;
  state.travelSystem = normalizeTravelSystem(state.travelSystem);
  const deltas = [];
  if (action === "repair") {
    const cost = Math.max(20, Math.round((100 - state.travelSystem.condition) * 1.6));
    if (state.travelSystem.condition >= 96 || state.stats.money < cost) return;
    changeStat("money", -cost, deltas);
    state.travelSystem.condition = 100;
    addLedger("修整车马", -cost, "更换车楔、补油车轴并照料马匹。" );
    return finishAction("车马修整", "车马铺师傅重新校正车轮、添油车轴，马匹也得了草料歇息。", deltas, "CarShop");
  }
  const next = TRAVEL_CARRIAGES[state.travelSystem.carriageLevel];
  if (!next || state.stats.money < next.price) return;
  changeStat("money", -next.price, deltas);
  state.travelSystem.carriageLevel = next.level;
  state.travelSystem.condition = 100;
  addLedger("购置车马", -next.price, `换置${next.name}。`);
  finishAction("车马升级", `你在车马铺换置了${next.name}。${next.note}`, deltas, next.icon);
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
  } else if (id === "jianghu") {
    state.jianghu = normalizeJianghuState(state.jianghu);
    view.page = "jianghu";
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
    if (state.family.spouse && state.gender === "male") {
      if ((state.family.concubines || []).length >= 3) {
        title = "媒人";
        text = "媒人见你已有三房侧室，劝你先把内宅人情料理妥当，不肯再递新人名帖。";
      } else {
        state.family.concubineCandidate = normalizePartner({ name, relation: "待纳侧室", gender: "female", affection: randInt(48, 68), intimacy: 12 }, state.name.slice(0, 1), "待纳侧室", "concubine-candidate");
        changeStat("relationship", randInt(2, 6), deltas);
        title = "媒人递帖";
        text = `媒人听说你已有正妻，又递来${name}的名帖。若有意纳为侧室，可回亲友页再作决定。`;
      }
    } else if (state.family.spouse) {
      title = "媒人";
      text = "媒人知道你已有婚配，只与你说了几户亲友近况，没有再替你另牵姻缘。";
    } else {
      state.family.lover = name;
      state.family.loverMeta = normalizeRelative({ name, relation: "相看之人", gender: state.gender === "male" ? "female" : "male", affection: 64 }, state.name.slice(0, 1), "partner");
      changeStat("relationship", randInt(3, 8), deltas);
      title = "媒人";
      text = `媒人替你相看了${name}，说是颇有缘分。`;
    }
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
  recordGambleSeasonResult(total >= 0, deltas);
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
  recordGambleSeasonResult(amount > 0, deltas);
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
  recordGambleSeasonResult(playerWin, deltas);
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
  let playerWin = opener === "player" ? !bidTrue : bidTrue;
  let qianText = "";
  let caughtQian = false;
  if (state.jianghu?.enabledQian && state.jianghu.skills?.includes("qian")) {
    state.jianghu.enabledQian = false;
    const totalHeat = Number(state.jianghu.heat || 0) + Number(state.underworld?.heat || 0);
    caughtQian = Math.random() < 0.1 + totalHeat / 260;
    if (caughtQian) {
      playerWin = false;
      state.jianghu.records.caught += 1;
      state.jianghu.heat = clamp(state.jianghu.heat + 28);
      imposePrisonSentence(randInt(1, 3), "博坊出千败露");
      qianText = "你刚换过暗记，庄家便扣住手腕。袖中机关当场败露，你被打伤手指并押入牢中。";
    } else if (!playerWin && Math.random() < 0.68) {
      playerWin = true;
      state.jianghu.heat = clamp(state.jianghu.heat + 10);
      qianText = "你借开盅的一瞬换过暗记，原本的败局被悄悄扳成胜局。";
    } else {
      state.jianghu.heat = clamp(state.jianghu.heat + 4);
      qianText = "你摸到袖中暗记，却发现没有必要冒险，最终未动机关。";
    }
  }
  const amount = playerWin ? stake : -stake;
  const deltas = [];
  changeStat("money", amount, deltas);
  changeStat("mood", playerWin ? randInt(2, 6) : -randInt(2, 6), deltas);
  if (caughtQian) changeStat("physique", -randInt(8, 16), deltas);
  if (!playerWin && Math.random() > 0.68) changeStat("virtue", -randInt(1, 2), deltas);
  state.gamble.revealed = true;
  state.gamble.turn = "";
  state.gamble.result = {
    speaker: opener === "player" ? "你" : "对方",
    text: `${opener === "player" ? "你" : state.gamble.opponentName}开盅。双方共有 ${actual} 个 ${bid.face} 点，${gambleBidText(bid)}${bidTrue ? "成立" : "不成立"}，你${playerWin ? "赢下" : "输掉"} ${moneyText(stake)}。${qianText ? ` ${qianText}` : ""}`,
    playerWin,
    amount,
    actual,
  };
  state.lastDeltas = deltas;
  recordGambleSeasonResult(playerWin, deltas);
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

function startCourtesanParlor(forceNew = false) {
  if (!state || state.dead || state.prisonYears > 0 || state.age < COURTESAN_MIN_AGE) return;
  const currentYear = Number(state.year ?? state.age ?? 0);
  const existing = normalizeCourtesanVisit(state.courtesanVisit);
  state.courtesanVisit = !forceNew && existing?.startedYear === currentYear ? existing : createCourtesanVisit();
  view.page = "courtesanParlor";
  view.placeId = "theater";
  save();
  render();
}

function chooseBrothelCompanion(candidateId, actionId) {
  if (!state || state.dead || state.prisonYears > 0 || state.age < COURTESAN_MIN_AGE) return;
  const visit = normalizeCourtesanVisit(state.courtesanVisit);
  const action = BROTHEL_ACTIONS[actionId];
  const candidate = visit?.candidates.find((item) => item.id === candidateId);
  if (!visit || !action || !candidate) return;
  const cost = Math.max(40, Math.round(candidate.price * action.multiplier));
  if (state.stats.money < cost) return finishAction("囊中羞涩", `请${candidate.name}作陪需花费 ${moneyText(cost)}，你只得改日再来。`, [{ label: "钱财", value: "不足", negative: true }], "CashBox");
  const deltas = [];
  changeStat("money", -cost, deltas);
  changeStat("mood", actionId === "listen" ? randInt(4, 9) : actionId === "banquet" ? randInt(6, 12) : randInt(8, 15), deltas);
  changeStat("relationship", actionId === "listen" ? randInt(1, 4) : randInt(3, 8), deltas);
  if (actionId === "listen") changeStat("knowledge", randInt(1, 4), deltas);
  if (actionId === "banquet") changeStat("eq", randInt(2, 5), deltas);
  if (actionId === "intimate") changeStat("virtue", -randInt(2, 6), deltas);
  candidate.affection = clamp(Number(candidate.affection || 50) + (actionId === "intimate" ? randInt(8, 15) : randInt(4, 10)));
  candidate.visits = Math.max(0, Number(candidate.visits) || 0) + 1;
  state.courtesanVisit = visit;
  state.brothelRecords ||= { visits: 0, favorites: [] };
  state.brothelRecords.visits = Math.max(0, Number(state.brothelRecords.visits) || 0) + 1;
  if (candidate.visits >= 2 && !state.brothelRecords.favorites.includes(candidate.name)) state.brothelRecords.favorites.push(candidate.name);

  let text = "";
  if (actionId === "listen") text = `${candidate.name}在帘下为你演了一段${candidate.specialty}，又讲起曲中典故。你静坐听完，觉得这一晚并非只有酒色。`;
  if (actionId === "banquet") text = `你请${candidate.name}在雅间作陪。二人对坐小酌，从${candidate.specialty}谈到城中见闻，席散时已近更深。`;
  if (actionId === "intimate") text = `烛影渐低，${candidate.name}遣退侍儿，与你在后楼共度良宵。天明后彼此不问承诺，只留下一张写着名字的花笺。`;

  if (Math.random() < action.diseaseRisk) {
    const disease = sample(["风寒", "花柳暗疾", "惊悸"]);
    if (!state.diseases.includes(disease)) state.diseases.push(disease);
    deltas.push({ label: "病症", value: disease, negative: true });
    text += ` 回府后你渐觉不适，染上了${disease}。`;
  }
  if (state.family.spouse && actionId !== "listen" && Math.random() < 0.34) {
    state.family.spouseAffection = clamp(Number(state.family.spouseAffection || 78) - randInt(3, 9));
    if (state.family.spouseMeta) {
      state.family.spouseMeta.affection = state.family.spouseAffection;
      state.family.spouseMeta.jealousy = clamp(Number(state.family.spouseMeta.jealousy || 0) + randInt(4, 12));
    }
    changeStat("favorability", -randInt(0, 3), deltas);
    text += " 只是风声传回家中，枕边人难免心生芥蒂。";
  }
  if (candidate.visits >= 2 && !state.friends.some((friend) => friend.name === candidate.name)) {
    state.friends.push(normalizeFriend({ name: candidate.name, relation: "风月知己", gender: "female", age: candidate.age, physique: randInt(48, 76), affection: candidate.affection, lastMet: state.age }));
    text += ` 数次往来后，${candidate.name}愿把你当作一位可说真话的风月知己。`;
  }
  if (state.brothelRecords.visits >= 3 && !state.tags.includes("瓦舍常客")) state.tags.push("瓦舍常客");
  addLedger("青楼雅座", -cost, `${action.label} · ${candidate.name}`);
  addLog(`瓦舍 · ${candidate.name}`, text, deltas);
  finishAction(`${candidate.name} · ${action.label}`, `${text} 此番花销 ${moneyText(cost)}。`, deltas, action.icon);
}

function performPlaceAction(id) {
  if (!state || state.dead || state.prisonYears > 0) return;
  if (id === "prepareExam") return prepareExam();
  if (id === "poetryMeet") return openPoetryContest();
  if (id === "courtesanContest") return startCourtesanContest();
  if (id === "courtesanParlor") return startCourtesanParlor();
  if (id === "templeDrawLot") return drawTempleFortune();
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
  if (black && item.name === "赝造荐书") acquireSecret("fake-title", deltas, { silent: true });
  if (black && item.name === "无名丹" && Math.random() > 0.72) acquireSecret("bandit-tie", deltas, { silent: true });
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
  const season = ensureLeisureSeason();
  const target = contest ? randInt(45, 95) + Math.min(8, season.cricketWins) : randInt(25, 86);
  const agePenalty = Math.max(0, selected.age - 4) * 4;
  const score = selected.quality - agePenalty + randInt(-18, 18);
  const win = score >= target;
  if (win) {
    selected.wins = (selected.wins || 0) + 1;
    state.cricketRecord.wins += 1;
    const prize = contest ? randInt(180, 620) + season.cricketWins * 12 : randInt(25, 120);
    changeStat("money", prize, deltas);
    addLedger(contest ? "促织大赛" : "斗促织", prize, `${selected.name}获胜。`);
    if (contest && selected.wins >= 3) state.cricketRecord.champion += 1;
  } else {
    state.cricketRecord.losses += 1;
    changeStat("mood", -randInt(2, 7), deltas);
  }
  recordCricketSeasonResult(win, contest, deltas);
  const title = contest ? "府城促织大赛" : "斗促织";
  const seasonNote = contest ? ` 本季大赛胜场 ${season.cricketWins}。` : "";
  const text = (win ? `${selected.name}振翅扑斗，竟胜过对手。` : `${selected.name}临阵失势，被对手压住了声势。`) + seasonNote;
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
  if (target.kind === "spouse" || target.kind === "concubine") return interactPartner(target, actionId);
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
  rememberNpcMoment(target.person, "你们的往来", `你曾在${state.age}岁时${action.label}${target.name}`, actionId === "borrow" ? -2 : actionId === "gift" || actionId === "care" ? 3 : 1);
  if (actionId === "care" && Number.isFinite(Number(target.person.physique))) {
    const boost = randInt(2, 6);
    target.person.physique = clamp(Number(target.person.physique) + boost);
    deltas.push({ label: `${target.name}体魄`, value: `+${boost}` });
  }
  target.person.lastMet = state.age;
  const followup = relationFollowup(target, actionId, deltas);
  finishAction(action.label, `${action.label}${target.name}，情分有了新的冷暖。${followup}`, deltas, action.icon);
}

function interactPartner(target, actionId) {
  const action = RELATION_ACTIONS[actionId];
  if (!action || !target?.person || target.person.alive === false) return;
  if (action.partnerOnly !== true && !["gift", "care"].includes(actionId)) return;
  if (action.cost && state.stats.money < action.cost) return;
  const affection = target.kind === "spouse" ? Number(state.family.spouseAffection ?? target.person.affection ?? 78) : Number(target.person.affection ?? 60);
  if (actionId === "intimate" && (state.age < 18 || affection < 25)) return;
  if (actionId === "intimate" && Number(target.person.lastIntimateYear) === Number(state.year)) {
    return finishAction("枕边相伴", `你今岁已多次留在${target.name}房中。对方劝你保重精神，来日再好好相伴。`, [], "ArrangeMarriage");
  }

  const deltas = [];
  if (action.cost) {
    changeStat("money", -action.cost, deltas);
    addLedger(actionId === "outing" ? "夫妻同游" : "内宅用度", -action.cost, `${action.label}${target.name}。`);
  }
  changeStat("relationship", rangeValue(action.relationship || [0, 0]), deltas);
  if (action.mood) changeStat("mood", rangeValue(action.mood), deltas);
  const affectionGain = rangeValue(action.affection || [0, 0]);
  target.person.affection = clamp(affection + affectionGain);
  rememberNpcMoment(target.person, "夫妻往事", `你曾在${state.age}岁时与${target.name}${action.label}`, actionId === "intimate" ? 3 : actionId === "gift" || actionId === "care" ? 2 : 1);
  if (target.kind === "spouse") state.family.spouseAffection = target.person.affection;

  if (actionId === "care") {
    const boost = randInt(3, 8);
    target.person.physique = clamp(Number(target.person.physique || 55) + boost);
    deltas.push({ label: `${target.name}体魄`, value: boost });
  }
  if (actionId === "outing") state.family.romanceRecords.outings += 1;
  if (actionId === "intimate") {
    state.family.romanceRecords.intimate += 1;
    target.person.lastIntimateYear = state.year;
    target.person.intimacy = clamp(Number(target.person.intimacy || 0) + randInt(6, 14));
    state.family.intimacyBonus = clamp(Number(state.family.intimacyBonus || 0) + 0.16, 0, 0.45);
    if (target.kind === "concubine" && state.family.spouseMeta) {
      state.family.spouseMeta.jealousy = clamp(Number(state.family.spouseMeta.jealousy || 0) + randInt(1, 5), 0, 100);
    }
  }
  target.person.lastMet = state.age;
  const story = sample(PARTNER_STORIES[actionId] || []) || `${action.label}${target.name}，两人的情分更近了一步。`;
  finishAction(action.label, story, deltas, action.icon);
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
    const relation = state.gender === "male" ? "妻子" : "夫君";
    state.family.spouseMeta = normalizePartner({ relation, gender: state.gender === "female" ? "male" : "female", alive: true, ...state.family.spouseMeta, name: state.family.spouse, affection: state.family.spouseAffection }, state.name.slice(0, 1), relation, "spouse");
    return { kind: "spouse", name: state.family.spouse, person: state.family.spouseMeta };
  }
  if (id === "lover" && state.family.lover) {
    state.family.loverMeta = normalizeRelative({ relation: "相看之人", gender: state.gender === "female" ? "male" : "female", alive: true, affection: 64, ...state.family.loverMeta, name: state.family.lover }, state.name.slice(0, 1), "partner");
    return { kind: "lover", name: state.family.lover, person: state.family.loverMeta };
  }
  const concubine = (state.family.concubines || []).find((person) => person.id === id || person.name === id);
  if (concubine) return { kind: "concubine", name: concubine.name, person: concubine };
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

function redeemCourtesan(candidateId) {
  if (!state || state.dead || state.prisonYears > 0 || state.age < COURTESAN_MIN_AGE) return;
  const visit = normalizeCourtesanVisit(state.courtesanVisit);
  const candidate = visit?.candidates.find((item) => item.id === candidateId);
  if (!visit || !candidate || candidate.affection < COURTESAN_REDEEM_AFFECTION || candidate.visits < COURTESAN_REDEEM_VISITS) return;
  if (state.gender === "male" && (state.family.concubines || []).filter((item) => item.alive !== false).length >= 3) return finishAction("内宅已满", "家中已有三房侧室，暂不能再安置赎身之人。", [{ label: "侧室", value: "已满", negative: true }], "FamilyConcubineAvatar");
  const cost = Math.max(1200, Math.round(candidate.price * 12));
  if (state.stats.money < cost) return finishAction("赎资不足", `替${candidate.name}赎身需 ${moneyText(cost)}，眼下钱财不足。`, [{ label: "钱财", value: "不足", negative: true }], "CashBox");
  const deltas = [];
  changeStat("money", -cost, deltas);
  changeStat("mood", 8, deltas);
  changeStat("relationship", 7, deltas);
  if (state.gender === "male") {
    state.family.concubines ||= [];
    state.family.concubines.push(normalizePartner({
      id: `concubine-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: candidate.name,
      relation: "妾室",
      gender: "female",
      age: candidate.age,
      physique: randInt(52, 82),
      affection: clamp(candidate.affection + 6),
      intimacy: 24,
      redeemed: true,
      portrait: candidate.portrait,
    }, state.name.slice(0, 1), "妾室", "concubine"));
    if (state.family.spouseMeta) {
      state.family.spouseAffection = clamp(Number(state.family.spouseAffection || 78) - 6);
      state.family.spouseMeta.affection = state.family.spouseAffection;
      state.family.spouseMeta.jealousy = clamp(Number(state.family.spouseMeta.jealousy || 0) + 10);
    }
  } else {
    state.friends = state.friends.filter((friend) => friend.name !== candidate.name);
    state.friends.push(normalizeFriend({ name: candidate.name, relation: "赎身女伴", gender: "female", age: candidate.age, physique: randInt(52, 82), affection: clamp(candidate.affection + 6), lastMet: state.age }));
  }
  visit.candidates = visit.candidates.filter((item) => item.id !== candidate.id);
  state.courtesanVisit = visit;
  state.brothelRecords.favorites = [...new Set([...(state.brothelRecords.favorites || []), candidate.name])];
  addLedger("替人赎身", -cost, `为${candidate.name}脱籍赎身。`);
  finishAction("赎身出坊", `你备齐 ${moneyText(cost)}，替${candidate.name}销去乐籍、赎出坊门。${state.gender === "male" ? "她随你回府，以侧室身份重新安顿。" : "她以女伴身份留在你身边，自此不必再迎来送往。"}`, deltas, "ArrangeMarriage");
}

function drawTempleFortune() {
  if (!state || state.dead || state.prisonYears > 0) return;
  state.templeFortune = normalizeTempleFortune(state.templeFortune);
  if (state.templeFortune.active) {
    const current = TEMPLE_FORTUNES.find((item) => item.id === state.templeFortune.active.id);
    return finishAction("签意未应", `你手中已有一支“${current?.title || "旧签"}”尚待应验。寺祝劝你静候来年，不可反复求问。`, [], "Temple");
  }
  if (state.templeFortune.lastDrawYear === state.year) return finishAction("今日已求签", "寺祝收起签筒，请你待来年再问。", [], "Temple");
  const cost = Math.min(30, Math.max(0, state.stats.money));
  const deltas = [];
  changeStat("money", -cost, deltas);
  changeStat("mood", 2, deltas);
  const lot = sample(TEMPLE_FORTUNES) || TEMPLE_FORTUNES[0];
  state.templeFortune.active = { id: lot.id, drawnYear: state.year, dueYear: state.year + 1 };
  state.templeFortune.lastDrawYear = state.year;
  addLedger("寺庙求签", -cost, `求得${lot.grade}“${lot.title}”。`);
  finishAction(`${lot.grade} · ${lot.title}`, `${lot.verse}\n\n解签：${lot.interpretation} 这支签会在下一流年的具体剧情中应验。`, deltas, lot.icon);
}

function annualSecretIntroductionEvent() {
  if (state.age < 15 || state.age > 17 || state.secretLines?.introduced || state.prisonYears > 0) return null;
  return {
    kind: "secretIntroduction",
    title: "夜雨黑帖 · 城中三条暗线",
    content: "雨夜里，一封没有署名的黑帖从门缝滑入。纸上只画着三样东西：贡院号牌、染血卷宗和一枚灌铅骰子。帖末写道：‘世间不止一条明路。’",
    children: [
      { title: "循帖探查", note: "开启奇闻暗线总览", content: "你照着暗记来到城南废庙。中介、仵作和江湖客各守一盏灯，三条隐秘道路从此向你敞开。", route: "secrets" },
      { title: "先收进匣中", note: "入口仍会保留在主界面", content: "你暂时没有赴约，却把黑帖留在身边。往后若想追查，随时可以从奇闻暗线进入。", route: "main" },
    ],
  };
}

function resolveSecretIntroduction(event, choice) {
  const deltas = [];
  state.secretLines.introduced = true;
  state.secretLines.legacyEligible = false;
  if (choice.route === "secrets") {
    state.secretLines.seenHub = true;
    state.secretLines.lastVisitedYear = state.year;
    changeStat("eq", 2, deltas);
    changeStat("mood", 2, deltas);
  }
  state.currentEvent = null;
  state.lastDeltas = deltas;
  view.page = choice.route || "main";
  addLog(event.title, choice.content, deltas);
  state.eventResult = { title: choice.title, text: choice.content, deltas, icon: "PrisonHeader", scene: "ink" };
  save();
  render();
}

function annualUnderworldEvent() {
  const extortion = state.underworld?.extortion;
  if (!extortion || state.year < extortion.dueYear) return null;
  return {
    kind: "underworldConsequence",
    consequence: "extortion",
    title: "旧把柄 · 再次索银",
    content: `${extortion.name}拿着当年科场暗记登门，索要 ${moneyText(extortion.amount)}，否则便把证据送进贡院。`,
    children: [
      { title: "付钱封口", note: `损失 ${moneyText(extortion.amount)}，风声略降`, content: "你交出银钱，对方收起暗记，却没有保证这是最后一次。", choice: "pay" },
      { title: "拒绝受制", note: "保住钱财，赌对方不敢同归于尽", content: "你拒绝再付一文，并警告对方若告发便是同罪。", choice: "refuse" },
    ],
  };
}

function resolveUnderworldConsequence(event, choice) {
  const deltas = [];
  const extortion = state.underworld.extortion;
  if (choice.choice === "pay" && extortion) {
    const amount = Math.min(state.stats.money, extortion.amount);
    changeStat("money", -amount, deltas);
    state.underworld.heat = clamp(state.underworld.heat - 8);
  } else if (Math.random() < 0.48 + state.underworld.heat / 200) {
    changeStat("favorability", -randInt(8, 16), deltas);
    state.underworld.records.exposed += 1;
    if (state.career && careerKind(state.career) === "official") state.official.merit = Math.max(0, state.official.merit - randInt(80, 180));
  } else {
    changeStat("eq", 3, deltas);
  }
  state.underworld.extortion = null;
  state.currentEvent = null;
  addLog(event.title, choice.content, deltas);
  state.eventResult = { title: choice.title, text: choice.content, deltas, icon: "PrisonHeader" };
  save();
  render();
}

function annualJianghuEvent() {
  const pursuit = state.jianghu?.pursuit;
  if (pursuit && state.year >= pursuit.dueYear) {
    return { kind: "jianghuProphecy", prophecyType: "pursuit", title: "苦主追门", content: `${pursuit.reason}。几名壮汉已经堵在巷口。`, children: [{ title: "赔钱息事", note: "破财消灾", content: "你赔出一笔药钱，请中人作保平息此事。", choice: "pay" }, { title: "翻墙脱身", note: "体魄检定，失败可能入狱", content: "你从后窗翻墙，沿屋脊甩开追来的人。", choice: "run" }] };
  }
  const prophecy = state.jianghu?.prophecy;
  if (!prophecy || state.year < prophecy.dueYear) return null;
  const truthful = prophecy.truthful;
  const configs = {
    blood: { title: "三年卦应 · 血光", content: truthful ? "无灯巷中突然冲出持刀仇家，卦中那句血光之灾真的来了。" : "三年前所说的血光之期已到，日子却平静得出奇。", choices: truthful ? [{ title: "转身迎敌", note: "体魄抵挡", content: "你早有戒心，抓起木杖迎住刀锋。", choice: "bold" }, { title: "舍财脱身", note: "花钱雇人护送", content: "你把钱袋抛向另一侧，趁乱退入巡夜人群。", choice: "safe" }] : [{ title: "原是虚言", content: "你终于明白那只是一句碰运气的江湖套话。", choice: "false" }] },
    wealth: { title: "三年卦应 · 旧物生财", content: truthful ? "东门果然有人送来一张旧契，祖宅墙外竟还有一间漏记铺面。" : "你守着东门等了一整日，只有卖饼小贩经过。", choices: [{ title: truthful ? "接下旧契" : "收起卦纸", content: truthful ? "你核验契纸，意外收回一笔旧产。" : "预言没有应验，你把卦纸压进箱底。", choice: truthful ? "wealth" : "false" }] },
    noble: { title: "三年卦应 · 贵人叩门", content: truthful ? "一位青衣官员登门，正要寻能办一桩难事的人。" : "三年之期已过，所谓青衣贵人始终没有出现。", choices: [{ title: truthful ? "开门相迎" : "一笑置之", content: truthful ? "你接下引荐，前程忽然多出一条路。" : "你不再把江湖批命放在心上。", choice: truthful ? "noble" : "false" }] },
  };
  const config = configs[prophecy.type] || configs.blood;
  return { kind: "jianghuProphecy", prophecyType: prophecy.type, truthful, ...config, children: config.choices };
}

function resolveJianghuProphecy(event, choice) {
  const deltas = [];
  if (event.prophecyType === "pursuit") {
    if (choice.choice === "pay") changeStat("money", -Math.min(state.stats.money, randInt(120, 320)), deltas);
    else if (Math.random() + state.stats.physique / 150 < 0.8) { imposePrisonSentence(1, "江湖旧账追缉"); changeStat("physique", -randInt(4, 10), deltas); }
    else changeStat("mood", 3, deltas);
    state.jianghu.pursuit = null;
  } else {
    if (event.truthful) state.jianghu.records.trueProphecies += 1;
    if (choice.choice === "bold") changeStat("physique", Math.random() < 0.6 ? -3 : -10, deltas);
    if (choice.choice === "safe") changeStat("money", -Math.min(state.stats.money, 100), deltas);
    if (choice.choice === "wealth") changeStat("money", randInt(350, 800), deltas);
    if (choice.choice === "noble") { changeStat("relationship", 8, deltas); changeStat("favorability", 5, deltas); }
    state.jianghu.prophecy = null;
  }
  state.currentEvent = null;
  addLog(event.title, choice.content, deltas);
  state.eventResult = { title: choice.title, text: choice.content, deltas, icon: "Temple" };
  save();
  render();
}

function annualFortuneEvent() {
  const active = state.templeFortune?.active;
  if (!active || state.year < active.dueYear) return null;
  const lot = TEMPLE_FORTUNES.find((item) => item.id === active.id) || TEMPLE_FORTUNES[0];
  const stories = {
    noble: {
      content: "签中所言的贵人果然来访：一位旧识愿替你引见门路，但也盼你日后记得这份人情。",
      children: [
        { title: "受其提携", note: "得人脉与声望，也欠下一份人情", content: "你郑重受下引荐，门路顿开，也把这份人情记在心里。", effects: { relationship: 8, favorability: 5, eq: 2 } },
        { title: "婉言自守", note: "少些捷径，保全德行与心境", content: "你谢过好意，只请对方饮茶叙旧，不以人情换前程。", effects: { virtue: 6, mood: 4, relationship: 2 } },
      ],
    },
    wealth: {
      content: "东市有人邀你合做一笔买卖，正应了签上“财入东门”四字。",
      children: [
        { title: "稳妥入股", note: "小有收益，风险较低", content: "你只投了能承受的本钱，账目清楚，旬月后果然分得红利。", effects: { money: 180, eq: 3 } },
        { title: "放胆押注", note: "收益更高，也会伤些心神", content: "你押上重注，几经波折才赚回一笔厚利，夜里却没少惊醒。", effects: { money: 420, mood: -7, virtue: -2 } },
      ],
    },
    family: {
      content: "久未登门的亲眷忽然来信，愿借家宴化解旧日芥蒂，堂前灯火正如签诗所示。",
      children: [
        { title: "设宴团圆", note: "花钱修复亲情", content: "你备下家宴，让旧话在灯下说开，席散时众人终于有了笑意。", effects: { money: -80, relationship: 10, mood: 6 } },
        { title: "写信劝和", note: "省下花销，效果温和", content: "你亲笔回信，句句留有余地，虽未立刻团聚，旧隙也渐渐松动。", effects: { relationship: 5, virtue: 3 } },
      ],
    },
    study: {
      content: "一位游学先生携残卷到访，请你共同校勘。字句艰涩，正是一场耐心与学识的考验。",
      children: [
        { title: "闭门校书", note: "增长学识，耗费心神", content: "你与先生连校数夜，终于补全残篇，也悟出许多旧义。", effects: { knowledge: 8, mood: -3 } },
        { title: "请益后收藏", note: "稳中有进", content: "你不强求一时读尽，只记下先生讲解，留待日后慢慢参详。", effects: { knowledge: 4, virtue: 2, mood: 2 } },
      ],
    },
    warning: {
      content: "夜里屋梁忽折，继而又传来街坊疫气。下签的警示果然应验，幸而你已有防备。",
      children: [
        { title: "舍财修屋施药", note: "破财挡灾，保全体魄与德行", content: "你立即修屋，又买药分给家人邻里，花销不小，却把险情压了下去。", effects: { money: -160, virtue: 7, physique: 3 } },
        { title: "紧闭门户观望", note: "省钱但可能伤身", content: "你只闭门自守，虽省下一笔钱，惊惧与湿寒仍伤了身体。", effects: { physique: -8, mood: -5 } },
      ],
    },
  };
  const story = stories[lot.id] || stories.warning;
  return { kind: "fortuneEvent", fortuneId: lot.id, title: `签运应验 · ${lot.title}`, content: story.content, children: story.children };
}

function resolveFortuneEvent(event, choice) {
  const deltas = [];
  for (const [key, value] of Object.entries(choice.effects || {})) changeStat(key, value, deltas);
  const lot = TEMPLE_FORTUNES.find((item) => item.id === event.fortuneId) || TEMPLE_FORTUNES[0];
  state.templeFortune ||= normalizeTempleFortune();
  state.templeFortune.history.push({ id: lot.id, grade: lot.grade, drawnYear: state.templeFortune.active?.drawnYear ?? state.year - 1, resolvedYear: state.year, choice: choice.title });
  state.templeFortune.history = state.templeFortune.history.slice(-12);
  state.templeFortune.active = null;
  state.currentEvent = null;
  state.lastDeltas = deltas;
  addLog(`签运应验 · ${lot.grade}`, choice.content, deltas);
  state.eventResult = { title: choice.title, text: `${choice.content} 去年所求的“${lot.title}”至此应验。`, deltas, icon: lot.icon };
  save();
  render();
}

function marryChild(id) {
  const child = livingChildren().find((item) => item.id === id);
  if (!child || child.age < CHILD_MARRIAGE_AGE || child.spouse || state.dead || state.prisonYears > 0) return;
  if (state.stats.money < CHILD_MARRIAGE_COST) return finishAction("婚资不足", `替${child.name}操办婚事至少需 ${moneyText(CHILD_MARRIAGE_COST)}。`, [{ label: "钱财", value: "不足", negative: true }], "ArrangeMarriage");
  const spouseGender = child.gender === "female" ? "male" : "female";
  const relation = child.gender === "female" ? "女婿" : "儿媳";
  const spouse = normalizeRelative({
    id: `inlaw-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: makePersonName(spouseGender),
    relation,
    gender: spouseGender,
    age: clamp(child.age + randInt(-3, 4), CHILD_MARRIAGE_AGE, 55),
    physique: randInt(52, 86),
    affection: randInt(58, 82),
  }, state.name.slice(0, 1), "partner");
  const deltas = [];
  changeStat("money", -CHILD_MARRIAGE_COST, deltas);
  changeStat("mood", randInt(4, 10), deltas);
  changeStat("relationship", randInt(4, 9), deltas);
  child.spouse = spouse;
  child.marriageYear = state.year;
  child.grandchildren ||= [];
  addLedger("子女婚仪", -CHILD_MARRIAGE_COST, `为${child.name}与${spouse.name}操办婚礼。`);
  finishAction("子女成婚", `你替${child.name}备下婚书与喜宴，迎来${relation}${spouse.name}。自此家谱添了一门姻亲，往后也可能再添孙辈。`, deltas, "ArrangeMarriage");
}

function inheritFromChild(id) {
  const heir = eligibleHeirs().find((item) => item.id === id);
  if (!state.dead || !heir) return;
  if (heir.heirKind === "spouse") return inheritFromSpouse(heir);
  const oldName = state.name;
  const oldLog = [...state.log];
  const oldGender = state.gender;
  const oldScore = lifeScore();
  const oldGrade = lifeGrade(oldScore);
  const generation = Math.max(1, Number(state.lineage?.generation) || 1);
  const generationStep = heir.heirKind === "grandchild" ? 2 : 1;
  const heirParent = heir.heirKind === "grandchild" ? livingChildren().find((child) => child.id === heir.parentId) : null;
  const inheritedMoney = Math.max(20, Math.round(Math.max(0, state.stats.money || 0) * 0.78));
  const inheritedAssets = (state.assets || []).map((asset) => ({ ...asset, inherited: true, owner: heir.name }));
  const inheritedInventory = [...new Set([...(state.inventory || []), "家书"])]
    .filter((item) => typeof item === "string")
    .slice(0, 18);
  const familyName = heir.name.slice(0, 1);
  const spouseName = state.family.spouse;
  const siblingSource = heirParent ? (heirParent.grandchildren || []).filter((item) => item.alive !== false) : livingChildren();
  const siblings = siblingSource
    .filter((child) => child.id !== heir.id)
    .map((child) => ({
      ...normalizeNpcAgency(child, child.gender === "female" ? (child.age >= heir.age ? "姐姐" : "妹妹") : child.age >= heir.age ? "哥哥" : "弟弟", child.age),
      name: child.name,
      relation: child.gender === "female" ? (child.age >= heir.age ? "姐姐" : "妹妹") : child.age >= heir.age ? "哥哥" : "弟弟",
      gender: child.gender,
      alive: child.alive,
      affection: child.affection,
      age: child.age,
      physique: randInt(45, 78),
    }));
  const inheritedSpouse = heir.heirKind === "child" && heir.spouse && heir.spouse.alive !== false ? heir.spouse : null;
  const inheritedChildren = heir.heirKind === "child" ? (heir.grandchildren || []).filter((item) => item.alive !== false).map((item) => ({ ...item, relation: item.gender === "female" ? "女儿" : "儿子", parentId: undefined })) : [];
  const directFather = oldGender === "male" ? oldName : spouseName || `${familyName}父`;
  const directMother = oldGender === "female" ? oldName : spouseName || `${familyName}母`;
  const parentFather = heirParent?.gender === "male" ? heirParent.name : heirParent?.spouse?.name || `${familyName}父`;
  const parentMother = heirParent?.gender === "female" ? heirParent.name : heirParent?.spouse?.name || `${familyName}母`;
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
    dynasty: carryDynastyAcrossInheritance(state.dynasty, state.year, startAge),
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
      { age: startAge, title: "承继家业", text: `${oldName}身后，${heir.name}以${heir.heirKind === "grandchild" ? heir.relation : "子女"}身份承继第 ${generation + generationStep} 代家业。上一代命格总评为${oldGrade}，${oldScore}分；遗下钱财 ${moneyText(inheritedMoney)}、家产 ${inheritedAssets.length} 处。` },
      { age: startAge, title: "家族命册", text: `家中旧事由长辈收束成册，${heir.name}自此接过门户，也接过${oldName}未竟之事。` },
      ...oldLog.slice(0, 42).map((item) => ({ ...item, inherited: true })),
    ],
    biography: `${heir.name}承${oldName}遗业而立，是这一门第 ${generation + generationStep} 代主事人。家中旧事皆入命册，钱财田宅亦随之过户。`,
    assets: inheritedAssets,
    ledger: [
      { age: startAge, title: "承继家产", amount: inheritedMoney, text: `承继${oldName}遗下的钱财与产业。` },
      ...(state.ledger || []).slice(0, 80).map((item) => ({ ...item, inherited: true })),
    ],
    crickets: [],
    cricketRecord: { wins: 0, losses: 0, champion: 0 },
    femaleSkills: heir.gender === "female" ? { 诗书: Math.floor(heirStudy / 20) } : {},
    official: createOfficialState(),
    lineage: {
      generation: generation + generationStep,
      familyName,
      ancestors,
    },
    life: { milestones: [], goals: [] },
    study: { prep: Math.floor(heirStudy / 4), lastYear: -1 },
    gamble: createGambleRound(50),
    miniGames: createMiniGamesState(),
    courtesanContest: null,
    courtesanVisit: null,
    brothelRecords: { visits: 0, favorites: [] },
    market: { year: -1, factor: 1 },
    caravanMemory: normalizeCaravanMemory(state.caravanMemory),
    family: {
      father: { name: heirParent ? parentFather : directFather, relation: "父亲", gender: "male", alive: heirParent ? heirParent.gender === "male" ? heirParent.alive !== false : !!heirParent.spouse && heirParent.spouse.alive !== false : oldGender !== "male" && !!spouseName, age: heirParent ? (heirParent.gender === "male" ? heirParent.age : heirParent.spouse?.age || Math.max(22, heirAge + 20)) : oldGender === "male" ? state.age : Math.max(22, state.age - randInt(0, 5)), physique: heirParent ? randInt(42, 76) : oldGender === "male" ? 0 : randInt(38, 72), affection: 76 },
      mother: { name: heirParent ? parentMother : directMother, relation: "母亲", gender: "female", alive: heirParent ? heirParent.gender === "female" ? heirParent.alive !== false : !!heirParent.spouse && heirParent.spouse.alive !== false : oldGender !== "female" && !!spouseName, age: heirParent ? (heirParent.gender === "female" ? heirParent.age : heirParent.spouse?.age || Math.max(22, heirAge + 20)) : oldGender === "female" ? state.age : Math.max(22, state.age - randInt(0, 5)), physique: heirParent ? randInt(42, 76) : oldGender === "female" ? 0 : randInt(38, 72), affection: 76 },
      siblings,
      lover: false,
      spouse: inheritedSpouse?.name || null,
      spouseMeta: inheritedSpouse,
      spouseHistory: [],
      concubines: [],
      concubineCandidate: null,
      intimacyBonus: 0,
      romanceRecords: { intimate: 0, outings: 0, conflicts: 0 },
      children: inheritedChildren,
    },
    exam: { rank: -1, attempts: 0, history: [], current: null, lastYear: -1 },
    pendingActivity: null,
    eventResult: null,
    pendingSurprise: null,
    pendingAchievement: null,
    pendingCaravan: null,
    currentEvent: null,
    inventoryTab: "all",
    templeFortune: { active: null, history: [], lastDrawYear: -1 },
    lastDeltas: [{ label: "承继", value: `${heir.name} · 第${generation + generationStep}代` }],
    dead: false,
    deathReason: "",
    prisonYears: 0,
  });
  view = { screen: "game", page: "main", tab: "overview", activityId: "", placeId: "", overlay: "" };
  save();
  render();
}

function inheritFromSpouse(heir) {
  if (!state.dead || !heir || heir.heirKind !== "spouse") return;
  const old = state;
  const oldName = old.name;
  const oldLog = [...old.log];
  const oldScore = lifeScore();
  const oldGrade = lifeGrade(oldScore);
  const generation = Math.max(1, Number(old.lineage?.generation) || 1);
  const inheritedMoney = Math.max(20, Math.round(Math.max(0, old.stats.money || 0) * 0.88));
  const inheritedAssets = (old.assets || []).map((asset) => ({ ...asset, inherited: true, owner: heir.name }));
  const familyName = heir.name.slice(0, 1) || old.name.slice(0, 1);
  const heirAge = Math.max(16, Math.round(Number(heir.age) || Math.max(18, old.age - 3)));
  const children = (old.family.children || []).map((child) => normalizeChild({ ...child, otherParent: child.otherParent || oldName }, child.name?.slice(0, 1) || oldName.slice(0, 1)));
  const ancestors = [{
    name: oldName,
    age: old.age,
    reason: old.deathReason || "命数已尽",
    score: oldScore,
    grade: oldGrade,
    exam: old.exam.rank >= 0 ? EXAM_TITLES[old.exam.rank] : "白身",
    assets: (old.assets || []).length,
    money: Math.round(old.stats.money || 0),
  }, ...((old.lineage?.ancestors || []).slice(0, 11))];
  const spouseMemory = normalizePartner({ name: oldName, relation: "故配", gender: "male", age: old.age, physique: 0, alive: false, affection: old.family.spouseAffection || 78 }, oldName.slice(0, 1), "故配", "former-spouse");
  state = normalizeState({
    name: heir.name,
    gender: "female",
    profileAvatar: defaultProfileAvatar("female"),
    difficulty: "承继",
    age: heirAge,
    year: heirAge,
    location: old.location,
    dynasty: carryDynastyAcrossInheritance(old.dynasty, old.year, heirAge),
    stats: {
      mood: clamp(48 + Math.floor(Number(heir.affection || 70) / 12)),
      physique: clamp(Number(heir.physique || 60)),
      looks: clamp(Number(heir.looks || 58)),
      eq: clamp(Number(heir.eq || 55)),
      knowledge: clamp(Number(heir.knowledge || heir.study || 42)),
      virtue: clamp(Number(heir.virtue || 55)),
      relationship: clamp(38 + Math.min(20, children.length * 4)),
      favorability: Math.max(0, Math.round(Number(old.stats.favorability || 0) * 0.25)),
      money: inheritedMoney,
    },
    talents: pickMany(DATA.database?.talents || [], 3),
    coreTalent: sample(DATA.database?.coreTalents || []),
    career: null,
    careerProgress: {},
    careerHistory: [],
    friends: [],
    tags: ["未亡人承业", "承继家业"],
    diseases: [],
    inventory: [...new Set([...(old.inventory || []), "亡夫家书"])].slice(0, 18),
    log: [
      { age: heirAge, title: "妻承夫业", text: `${oldName}身后，妻子${heir.name}没有让门户散去。她接过账册、田契与家中诸事，以未亡人身份继续第 ${generation} 代人生。` },
      { age: heirAge, title: "家族命册", text: `${heir.name}将${oldName}一生旧事收进命册，也决定从此以自己的名字续写后半生。` },
      ...oldLog.slice(0, 42).map((item) => ({ ...item, inherited: true })),
    ],
    biography: `${heir.name}原为${oldName}之妻。夫亡之后，她承接家业、抚育子女，成为这一门第 ${generation} 代新的主事人。`,
    assets: inheritedAssets,
    ledger: [{ age: heirAge, title: "妻承夫业", amount: inheritedMoney, text: `接掌${oldName}遗下的钱财与产业。` }, ...(old.ledger || []).slice(0, 80).map((item) => ({ ...item, inherited: true }))],
    crickets: [],
    cricketRecord: { wins: 0, losses: 0, champion: 0 },
    femaleSkills: { 诗书: Math.max(0, Math.floor(Number(heir.study || 35) / 20)) },
    official: createOfficialState(),
    lineage: { generation, familyName: old.lineage?.familyName || oldName.slice(0, 1), ancestors },
    life: { milestones: [], goals: [] },
    study: { prep: Math.floor(Number(heir.study || 35) / 5), lastYear: -1 },
    family: {
      father: { name: `${familyName}${sample(DATA.database?.names?.male) || "父"}`, relation: "父亲", gender: "male", alive: heirAge < 55, age: heirAge + randInt(18, 28), physique: heirAge < 55 ? randInt(38, 68) : 0, affection: 65 },
      mother: { name: `${sample(DATA.database?.names?.last) || "王"}${sample(DATA.database?.names?.female) || "氏"}`, relation: "母亲", gender: "female", alive: heirAge < 52, age: heirAge + randInt(17, 25), physique: heirAge < 52 ? randInt(38, 68) : 0, affection: 68 },
      siblings: [],
      lover: false,
      spouse: null,
      spouseMeta: null,
      spouseHistory: [spouseMemory],
      concubines: [],
      concubineCandidate: null,
      intimacyBonus: 0,
      romanceRecords: { intimate: 0, outings: 0, conflicts: 0 },
      children,
    },
    familyStories: { active: null, completed: [], lastTriggerYear: -1 },
    templeFortune: { active: null, history: [], lastDrawYear: -1 },
    exam: { rank: -1, attempts: 0, history: [], current: null, lastYear: -1 },
    pendingActivity: null,
    eventResult: null,
    pendingSurprise: null,
    pendingAchievement: null,
    pendingCaravan: null,
    currentEvent: null,
    inventoryTab: "all",
    lastDeltas: [{ label: "承继", value: `${heir.name} · 妻承夫业` }],
    dead: false,
    deathReason: "",
    prisonYears: 0,
  });
  view = { screen: "game", page: "main", tab: "overview", activityId: "", placeId: "", overlay: "" };
  save();
  render();
}

function marryLover() {
  if (!state.family.lover || (state.family.spouse && state.family.spouseMeta?.alive !== false) || state.age < 16) return;
  if (typeof SFX !== "undefined" && SFX.play) SFX.play("marry");
  const deltas = [];
  const profile = normalizeMatchCandidate(state.family.loverProfile) || generateMatchCandidate(state.gender === "male" ? "female" : "male");
  if (profile) profile.name = state.family.lover;
  const cost = profile ? profile.bridePrice + randInt(20, 80) : randInt(120, 420);
  if (state.stats.money < cost) {
    finishAction("婚仪未成", `彩礼与婚仪约需 ${moneyText(cost)}，手头尚不足，只得暂缓。`, [], "ArrangeMarriage");
    return;
  }
  const actualCost = cost;
  changeStat("money", -actualCost, deltas);
  changeStat("mood", randInt(8, 16), deltas);
  changeStat("relationship", randInt(6, 14) + Math.floor((profile?.power || 0) / 25), deltas);
  changeStat("favorability", Math.floor((profile?.power || 0) / 20), deltas);
  if (profile?.knowledge) changeStat("knowledge", randInt(0, Math.floor(profile.knowledge / 30)), deltas);
  state.family.spouse = state.family.lover;
  const relation = state.gender === "male" ? "妻子" : "夫君";
  state.family.spouseAffection = clamp(Number(state.family.loverMeta?.affection ?? state.family.spouseAffection ?? 82));
  state.family.spouseMeta = normalizePartner({ ...state.family.loverMeta, name: state.family.spouse, relation, affection: state.family.spouseAffection, intimacy: 28 }, state.name.slice(0, 1), relation, "spouse");
  state.family.spouseProfile = profile;
  state.family.lover = false;
  state.family.loverMeta = null;
  state.family.loverProfile = null;
  state.matchPool = [];
  addLedger("婚仪", -actualCost, `与${state.family.spouse}成婚。`);
  const profileText = profile
    ? `对方出自${profile.familyName}，性情${profile.personality}，彩礼婚仪约 ${moneyText(actualCost)}。婚后娘家势力与性情，都会慢慢显在日子里。`
    : "自此家中多了一位同路人。";
  finishAction("成婚", `红烛高照，你与${state.family.spouse}成礼。${profileText}`, deltas, "ArrangeMarriage");
}

function takeConcubine() {
  const candidate = state.family.concubineCandidate;
  if (!candidate || !state.family.spouse || state.gender !== "male" || state.age < 18 || (state.family.concubines || []).length >= 3) return;
  const cost = 220;
  if (state.stats.money < cost) return;
  const deltas = [];
  changeStat("money", -cost, deltas);
  changeStat("relationship", randInt(2, 6), deltas);
  const concubine = normalizePartner({ ...candidate, id: `concubine-${Date.now()}-${Math.random().toString(16).slice(2)}`, relation: "妾室", affection: clamp(Number(candidate.affection || 58) + 8), intimacy: 20 }, state.name.slice(0, 1), "妾室", "concubine");
  state.family.concubines.push(concubine);
  state.family.concubineCandidate = null;
  if (state.family.spouseMeta) {
    state.family.spouseAffection = clamp(Number(state.family.spouseAffection || 78) - randInt(2, 7));
    state.family.spouseMeta.affection = state.family.spouseAffection;
    state.family.spouseMeta.jealousy = clamp(Number(state.family.spouseMeta.jealousy || 0) + randInt(5, 12), 0, 100);
  }
  addLedger("纳妾仪礼", -cost, `纳${concubine.name}入府为侧室。`);
  finishAction("纳入侧室", `你备下仪礼，将${concubine.name}纳入府中。正妻虽维持体面，内宅从此多了一层需要经营的人情。`, deltas, "ArrangeMarriage");
}

function handleOfficialWork() {
  return performOfficialAction("affair:archives");
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

function officialCareerActions() {
  const rank = officialRankIndex();
  const office = officialOffice(rank);
  const actions = OFFICIAL_AFFAIRS
    .filter((affair) => rank >= affair.minRank)
    .map((affair) => [`affair:${affair.id}`, affair.label, affair.note]);
  actions.push(["case:post", `${office.office}专案`, `处理只属于${office.office}这一官职的高级剧情。`]);
  const cases = officialCasePool();
  actions.push(["case:random", "官场要案", cases.length ? "进入带选择的官场剧情，处理得当可涨政绩，也可能招祸。" : "官阶尚低，暂以日常案牍为主。"]);
  actions.push(["case:mystery", "离奇疑案", "多轮验尸、问证、搜查与翻卷，最后亲自指认真凶。"]);
  if (rank >= 4) actions.push(["exam:bribe", "贡院暗局", "有人带重金求购考题；卖题来钱极快，也会留下毁官把柄。"]);
  if (state.age >= 60 && !state.official?.retired) actions.push(["retire", "致仕归乡", `退下官身，回乡修谱、教导子孙，留下身后名。`]);
  actions.push(["resign", "辞去官职", `交还${office.office}印信，离开官场；之后方可改换其他营生。`]);
  return actions;
}

function officialTendencyId() {
  const clean = Number(state.official?.clean || 0);
  const corrupt = Number(state.official?.corruption || 0);
  if (corrupt >= 28 && corrupt - clean > 12) return "corrupt";
  if (clean >= 24 && clean >= corrupt) return "clean";
  return "neutral";
}

function officialTendencyMeta() {
  return OFFICIAL_TENDENCY[officialTendencyId()] || OFFICIAL_TENDENCY.neutral;
}

function officialAffairById(id) {
  return OFFICIAL_AFFAIRS.find((item) => item.id === id) || OFFICIAL_AFFAIRS[0];
}

function officialCasePool() {
  const rank = officialRankIndex();
  return [...OFFICIAL_CASES.filter((item) => rank >= item.minRank), ...OFFICIAL_POST_CASES.filter((item) => item.minRank === rank)];
}

function officialPostCase(rank = officialRankIndex()) {
  return OFFICIAL_POST_CASES.find((item) => item.minRank === rank) || null;
}

function recordOfficialPost(reason = "任命") {
  state.official = normalizeOfficial(state.official);
  const rank = officialRankIndex();
  const latest = state.official.postHistory[state.official.postHistory.length - 1];
  if (latest?.rank === rank) return;
  state.official.postHistory.push({ rank, year: Math.round(Number(state.age) || 0), reason });
  state.official.postHistory = state.official.postHistory.slice(-20);
}

function performOfficialAction(type = "affair:archives") {
  if (!state.career || careerKind(state.career) !== "official") return;
  state.official = normalizeOfficial(state.official);
  ensureOfficialNetwork();
  if (state.official.retired) return finishAction("乡居", "你已致仕归乡，不再点卯办差。可在家中修谱、教导子孙，把官场旧事写入命册。", [], "Official");
  const action = String(type || "");
  if (action === "retire") return retireOfficial();
  if (action === "case:mystery") return startMysteryCase();
  if (action === "exam:bribe") return startExaminerBribe();
  if (action === "case:post") return startOfficialCase("post");
  if (action.startsWith("case:")) return startOfficialCase("random");
  return performOfficialAffair(action.replace("affair:", "") || "archives");
}

function performOfficialAffair(affairId) {
  const affair = officialAffairById(affairId);
  if (officialRankIndex() < affair.minRank) return;
  const deltas = [];
  const office = officialOffice();
  const progress = (state.careerProgress[state.career.name] ||= { exp: 0, level: 1 });
  const level = Math.max(1, Number(progress.level) || 1);
  const statScore = Number(state.stats[affair.primary] || 50) + Number(state.stats[affair.secondary] || 50);
  const success = Math.random() + statScore / 240 + level / 40 + Math.max(0, state.official.clean || 0) / 300 > 0.62;
  const rankBonus = Math.floor(officialRankIndex() / 3);
  const merit = Math.max(2, rangeValue(affair.merit) + rankBonus + Math.floor(statScore / 34) + (success ? randInt(4, 12) : -randInt(2, 8)));
  state.official.merit += merit;
  state.official.clean = clamp(Number(state.official.clean || 0) + Number(affair.clean || 0) + (success ? 1 : 0), -100, 100);
  state.official.records.affairs += 1;
  changeStat(affair.primary, success ? randInt(1, 4) : randInt(-2, 1), deltas);
  if (affair.secondary !== affair.primary) changeStat(affair.secondary, randInt(0, 3), deltas);
  changeStat("money", officialSalaryGain() + (success ? randInt(12, 44) : randInt(-24, 16)), deltas);
  if (success) changeStat("favorability", randInt(1, 4), deltas);
  if (affair.risk && Math.random() < affair.risk) changeStat("physique", -randInt(1, 6), deltas);
  deltas.push({ label: "政绩", value: merit, stat: "officialMerit" });
  if (affair.clean) deltas.push({ label: "清名", value: affair.clean + (success ? 1 : 0) });
  const relationText = officialNetworkAfterAffair(affair, success, deltas);
  let text = `你以${office.office}身份经手${affair.label}。${sample(affair.stories)}${success ? " 此事处置得当，案卷送上去时颇有分量。" : " 只是牵连甚广，收尾不算漂亮。"}得政绩 ${merit}。${relationText}`;
  text += maybeOfficialImpeachment(deltas);
  text += applyOfficialPromotion(deltas);
  progress.exp = Math.max(0, Number(progress.exp || 0) + randInt(10, 24));
  addLedger("官俸", deltas.filter((delta) => delta.stat === "money").reduce((sum, delta) => sum + Number(delta.value || 0), 0), text);
  unlockLifeGoals();
  finishAction(`官府 · ${affair.label}`, text, deltas, affair.icon || "Official");
}

function startOfficialCase(mode = "random") {
  const pool = officialCasePool();
  const item = mode === "post" ? officialPostCase() : sample(pool);
  if (!item) return performOfficialAffair("archives");
  state.currentEvent = officialCaseToEvent(item);
  save();
  render();
}

function officialCaseToEvent(item) {
  if (!item) return null;
  return {
    kind: "officialCase",
    id: item.id,
    title: item.title,
    content: item.prompt,
    icon: "Official",
    children: item.options.map((option) => ({
      ...option,
      title: option.label,
      content: option.text,
      children: [],
      conditions: [],
      results: [],
    })),
  };
}

function annualOfficialCaseEvent() {
  if (!state.career || careerKind(state.career) !== "official" || state.official?.retired) return null;
  const pool = officialCasePool();
  if (!pool.length) return null;
  const pressure = Math.min(0.18, Number(state.official?.corruption || 0) / 360 + Math.max(0, officialRankIndex() - 8) / 180);
  if (Math.random() > 0.11 + pressure) return null;
  return officialCaseToEvent(sample(pool));
}

function resolveOfficialCase(event, choice) {
  const deltas = [];
  state.official = normalizeOfficial(state.official);
  ensureOfficialNetwork();
  const merit = Math.max(-30, rangeValue(choice.merit || [0, 0]) + Math.floor(officialRankIndex() / 4));
  state.official.merit = Math.max(0, Number(state.official.merit || 0) + merit);
  state.official.clean = clamp(Number(state.official.clean || 0) + Number(choice.clean || 0), -100, 100);
  state.official.corruption = clamp(Number(state.official.corruption || 0) + Number(choice.corruption || 0), 0, 100);
  state.official.records.cases += 1;
  if (merit) deltas.push({ label: "政绩", value: merit, stat: "officialMerit" });
  if (choice.clean) deltas.push({ label: choice.clean > 0 ? "清名" : "浊名", value: Math.abs(choice.clean) });
  if (choice.corruption) deltas.push({ label: "贪墨", value: choice.corruption });
  for (const stat of ["mood", "physique", "looks", "eq", "knowledge", "virtue", "relationship", "favorability", "money"]) {
    if (choice[stat]) changeStat(stat, rangeValue(choice[stat]), deltas);
  }
  const relationText = officialNetworkAfterCase(choice, deltas);
  let text = `${choice.text || choice.content || choice.title}${relationText} ${merit >= 0 ? `得政绩 ${merit}。` : `政绩折损 ${Math.abs(merit)}。`}`;
  if (choice.impeachment && Math.random() < choice.impeachment) text += triggerOfficialCensure(deltas, "此案风声未平，御史闻讯递来弹章。");
  text += applyOfficialPromotion(deltas);
  state.currentEvent = null;
  state.eventResult = { title: choice.title || event.title || "官场要案", text, deltas, icon: "Official" };
  state.lastDeltas = deltas;
  addLog(event.title || "官场要案", text, deltas);
  unlockLifeGoals();
  save();
  render();
}

function officialSalaryGain() {
  return randInt(24, 76) + Math.floor(officialRankIndex() * 9) + Math.floor(Number(state.careerProgress?.[state.career?.name]?.level || 1) * 8);
}

function officialNetworkAfterAffair(affair, success, deltas) {
  const contacts = ensureOfficialNetwork();
  const contact = sample(contacts);
  if (!contact) return "";
  const shift = success ? randInt(1, 5) : -randInt(1, 4);
  contact.affection = clamp(Number(contact.affection || 0) + shift, -100, 100);
  deltas.push({ label: `${contact.relation}`, value: `${contact.name}${shift >= 0 ? "+" : ""}${shift}` });
  if (contact.relation === "政敌" && success) return ` ${contact.name}见你政声渐起，表面称赞，暗地却添了几分忌惮。`;
  if (shift >= 0) return ` ${contact.relation}${contact.name}读到案牍，觉得你办事尚稳。`;
  return ` ${contact.relation}${contact.name}嫌你收尾粗疏，批语里留了两句冷话。`;
}

function officialNetworkAfterCase(choice, deltas) {
  const contacts = ensureOfficialNetwork();
  if (!contacts.length) return "";
  const political = contacts.filter((item) => ["座主", "上司", "政敌", "同年"].includes(item.relation));
  const contact = sample(political.length ? political : contacts);
  const range = choice.relation || [0, 0];
  const shift = rangeValue(range);
  if (!shift) return "";
  contact.affection = clamp(Number(contact.affection || 0) + shift, -100, 100);
  deltas.push({ label: `${contact.relation}`, value: `${contact.name}${shift > 0 ? "+" : ""}${shift}` });
  return shift > 0 ? ` ${contact.relation}${contact.name}因此对你多了几分照拂。` : ` ${contact.relation}${contact.name}听闻后颇不满意，关系冷了下来。`;
}

function maybeOfficialImpeachment(deltas) {
  const corruptRisk = Number(state.official?.corruption || 0) / 260;
  const enemy = ensureOfficialNetwork().find((item) => item.relation === "政敌" && item.affection < -20);
  const risk = corruptRisk + (enemy ? 0.08 : 0) + (Number(state.official?.clean || 0) < -10 ? 0.06 : 0);
  if (risk <= 0 || Math.random() > risk) return "";
  return triggerOfficialCensure(deltas, enemy ? `${enemy.name}暗中递出弹章，说你治下多有不法。` : "朝中忽有风声，说你治下钱粮不清。");
}

function triggerOfficialCensure(deltas, intro) {
  state.official.records.impeachments += 1;
  const defense = Number(state.stats.eq || 50) + Number(state.stats.knowledge || 50) + Number(state.official.clean || 0) - Number(state.official.corruption || 0) + randInt(-30, 30);
  if (defense >= 95) {
    changeStat("favorability", randInt(1, 5), deltas);
    state.official.clean = clamp(Number(state.official.clean || 0) + 2, -100, 100);
    return ` ${intro}你具折自辩，证据周全，反使朝中知道你并非庸官。`;
  }
  if (defense >= 60) {
    const loss = randInt(18, 48);
    state.official.merit = Math.max(0, Number(state.official.merit || 0) - loss);
    deltas.push({ label: "政绩", value: -loss, negative: true });
    state.official.reviewLockUntil = Math.max(Number(state.official.reviewLockUntil || 0), state.year + 1);
    state.official.records.delayed += 1;
    return ` ${intro}你虽勉强脱身，考课却被压下一年，政绩也折了 ${loss}。`;
  }
  const oldTitle = officialTitle();
  if (officialRankIndex() > 0) {
    state.official.rank = officialRankIndex() - 1;
    recordOfficialPost("贬谪");
  }
  state.official.merit = Math.max(0, OFFICIAL_PROMOTION_MERIT[officialRankIndex()] || 0);
  changeStat("favorability", -randInt(4, 10), deltas);
  deltas.push({ label: "贬谪", value: officialTitle(), negative: true });
  return ` ${intro}你自辩失据，由${oldTitle}降为${officialTitle()}。`;
}

function applyOfficialPromotion(deltas = []) {
  let text = "";
  while (officialRankIndex() < OFFICIAL_RANKS.length - 1 && state.official.merit >= OFFICIAL_PROMOTION_MERIT[officialRankIndex() + 1]) {
    const review = officialReviewResult(deltas);
    if (review.blocked) {
      text += review.text;
      break;
    }
    const oldTitle = officialTitle();
    state.official.rank = officialRankIndex() + 1;
    ensureOfficialNetwork();
    recordOfficialPost("升迁");
    const title = officialTitle();
    text += ` ${review.text}由${oldTitle}升至 ${title}。`;
    deltas.push({ label: "官阶", value: title, type: "text" });
  }
  if (officialRankIndex() >= OFFICIAL_RANKS.length - 1) {
    text += " 仕途已至正一品，位极人臣。";
  }
  return text;
}

function officialReviewResult(deltas = []) {
  if (Number(state.official.reviewLockUntil || 0) > Number(state.year || state.age)) {
    return { blocked: true, text: " 考课虽已够格，但上一桩弹章余波未平，升迁暂缓。" };
  }
  const tendency = officialTendencyId();
  const network = ensureOfficialNetwork();
  const patron = network.find((item) => ["座主", "上司"].includes(item.relation));
  const enemy = network.find((item) => item.relation === "政敌");
  const patronBonus = patron ? Math.floor(Number(patron.affection || 0) / 8) : 0;
  const enemyPenalty = enemy && enemy.affection < 0 ? Math.floor(Math.abs(enemy.affection) / 10) : 0;
  const score = Number(state.stats.eq || 50) + Number(state.stats.knowledge || 50) + Number(state.official.clean || 0) - Math.floor(Number(state.official.corruption || 0) * 0.75) + patronBonus - enemyPenalty + randInt(-26, 28);
  if (score >= 112) {
    changeStat("favorability", randInt(2, 6), deltas);
    return { blocked: false, text: tendency === "clean" ? "考课上书称你清慎勤敏，吏治有声，" : tendency === "corrupt" ? "你打点得法，考语写得颇为圆熟，" : "考课列为上等，" };
  }
  if (score >= 74) return { blocked: false, text: "考课勉列中上，上司准你递补，" };
  const loss = randInt(20, 55);
  state.official.merit = Math.max(OFFICIAL_PROMOTION_MERIT[officialRankIndex()] || 0, Number(state.official.merit || 0) - loss);
  state.official.reviewLockUntil = Number(state.year || state.age) + randInt(1, 2);
  state.official.records.delayed += 1;
  return { blocked: true, text: ` 考课未能服众，上司批你“才具尚待磨砺”，升迁延后，政绩折损 ${loss}。` };
}

function retireOfficial() {
  if (!state.career || careerKind(state.career) !== "official" || state.official.retired || state.age < 60) return;
  const deltas = [];
  state.official.retired = true;
  state.career = null;
  const posthumous = officialPosthumousTitle();
  state.official.records.posthumous = posthumous;
  changeStat("mood", randInt(4, 10), deltas);
  changeStat("relationship", randInt(3, 8), deltas);
  changeStat("favorability", officialTendencyId() === "clean" ? randInt(3, 8) : randInt(-4, 2), deltas);
  if (officialTendencyId() === "clean") {
    for (const child of livingChildren()) child.study = clamp(Number(child.study || 0) + randInt(3, 8));
  }
  const text = `你上疏乞骸骨，朝廷准你以${officialTitle()}致仕。归乡后修族谱、置义田、教子孙读书。${posthumous}`;
  unlockLifeGoals();
  finishAction("致仕", text, deltas, "Official");
}

function officialPosthumousTitle() {
  const rank = officialRankIndex();
  const clean = Number(state.official?.clean || 0);
  const corrupt = Number(state.official?.corruption || 0);
  const merit = Number(state.official?.merit || 0);
  if (corrupt >= 45 && corrupt > clean + 10) return "身后恐遭言官追论，子孙科名也会受些牵连。";
  if (rank >= 15 && clean >= 32 && merit >= 4000) return "身后可望追赠太子太保，入祀乡贤祠。";
  if (rank >= 11 && clean >= 20) return "乡人多称你弊绝风清，日后或可入地方名宦志。";
  if (rank >= 8) return "一生官场有起有落，终归留下几卷案牍与些许政声。";
  return "官虽不显，亦算有始有终。";
}

function finishAction(title, text, deltas, iconName) {
  state.lastDeltas = deltas;
  const iconNameResolved = iconName || resultIcon({ title, content: text }, null);
  state.eventResult = { title, text, deltas, icon: iconNameResolved, scene: activitySceneFor(iconNameResolved, title, text) };
  addLog(title, text, deltas);
  save();
  render();
}

function activitySceneFor(iconName, title = "", text = "") {
  const source = `${iconName || ""}${title}${text}`;
  if (/Temple|Elixir|祈福|求签|法事|玄门/.test(source)) return "incense";
  if (/ArrangeMarriage|Whorehouse|Flower|婚|宴|瓦舍|琴|歌|舞/.test(source)) return "lantern";
  if (/RepairCarriage|Agriculture|出行|押镖|车|路|桥|旅途|游历|抵达/.test(source)) return "travel";
  if (/Book|Exam|书|试|学|画/.test(source)) return "ink";
  if (/Official|官|案|衙/.test(source)) return "seal";
  if (/Medicine|医|病/.test(source)) return "herb";
  return "petal";
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
  if (state.career) return state.career.name === career?.name ? "当前营生" : `须先辞去${currentCareerName()}`;
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

function meetJianghuMentor() {
  if (state.jianghu.mentor || state.stats.money < 80) return;
  const deltas = [];
  changeStat("money", -80, deltas);
  state.jianghu.mentor = { name: sample(["无影手", "赛半仙", "铁算盘婆", "过江狐"]), affection: randInt(48, 70) };
  changeStat("eq", 3, deltas);
  finishAction("拜入江湖门", `你在后巷茶棚连过三道试探，终于见到${state.jianghu.mentor.name}。对方收下茶钱，只说：“术可以学，命得自己担。”`, deltas, "GamblingHouse");
}

function learnJianghuSkill(id) {
  const skill = JIANGHU_SKILLS.find((item) => item.id === id);
  if (!skill || !state.jianghu.mentor || state.jianghu.skills.includes(id) || state.stats.money < skill.cost) return;
  const deltas = [];
  changeStat("money", -skill.cost, deltas);
  changeStat("virtue", -randInt(1, 4), deltas);
  state.jianghu.skills.push(id);
  state.jianghu.mentor.affection = clamp(state.jianghu.mentor.affection + 5);
  finishAction(`学会 · ${skill.name}`, `${state.jianghu.mentor.name}没有教你口诀，只让你在三场真局里自己看懂门道。从今以后，你可以施展“${skill.name}”。`, deltas, "GamblingHouse");
}

function useJianghuSkill(id) {
  if (!state.jianghu.skills.includes(id) || state.dead || state.prisonYears > 0) return;
  const deltas = [];
  state.jianghu.records.cons += 1;
  if (id === "qian") {
    state.jianghu.enabledQian = !state.jianghu.enabledQian;
    return finishAction("千术暗记", state.jianghu.enabledQian ? "你在袖口藏好暗记。下一次博坊开盅时，千术可能替你翻盘，也可能被当场识破。" : "你拆去袖口暗记，暂不在博坊出千。", [], "GamblingHouse");
  }
  if (id === "face") {
    const success = Math.random() + state.stats.eq / 160 > 0.62;
    changeStat("money", success ? randInt(45, 130) : randInt(5, 25), deltas);
    changeStat("relationship", success ? randInt(3, 7) : 1, deltas);
    if (success && Math.random() < 0.35) addFriend();
    return finishAction("街头相面", success ? "你从衣料、口音与手上薄茧推中来客身份，又顺着话头说中一件心事。对方惊疑之余奉上卦金。" : "你只说中几句人人都能对上的套话，来客听完笑笑便走。", deltas, "Relationship1");
  }
  if (id === "fortune") {
    if (state.jianghu.prophecy) return;
    const type = sample(["blood", "wealth", "noble"]);
    const texts = { blood: "三年之后，西南有血光，莫走无灯之路。", wealth: "三年之后，旧物生财，东门有人送契。", noble: "三年之后，青衣贵人叩门，一句话能改你的前程。" };
    state.jianghu.prophecy = { type, truthful: Math.random() < 0.58, dueYear: state.year + 3, text: texts[type] };
    state.jianghu.records.prophecies += 1;
    return finishAction("泄命一卦", `你以铜钱排出卦象，忽然说出：“${texts[type]}”这句话会不会成真，要等整整三年。`, [{ label: "预言", value: "三年后" }], "Temple");
  }
  if (id === "fakeMedicine") {
    const gain = randInt(160, 420);
    changeStat("money", gain, deltas);
    changeStat("virtue", -randInt(5, 11), deltas);
    state.jianghu.heat = clamp(state.jianghu.heat + randInt(18, 35));
    if (Math.random() < 0.58) state.jianghu.pursuit = { dueYear: state.year + 1, reason: "假药吃坏了人，苦主循着药包寻来" };
    return finishAction("走江湖卖药", `你把寻常药粉装进描金瓷瓶，靠一番口舌卖出 ${moneyText(gain)}。散场后却有人捂着肚子追问药方。`, deltas, "Elixir");
  }
  if (id === "impersonate") {
    if (!state.inventory.includes("官差衣冠")) return;
    const caught = Math.random() < 0.22 + state.jianghu.heat / 180;
    if (caught) {
      imposePrisonSentence(randInt(1, 4), "冒充官差败露");
      state.jianghu.records.caught += 1;
      state.jianghu.heat = clamp(state.jianghu.heat + 30);
      changeStat("favorability", -randInt(7, 14), deltas);
      return finishAction("诈官败露", "你披着官差衣冠沿街索取酒食，却被真正巡役认出腰牌制式不对，当场押入牢中。", deltas, "PrisonHeader");
    }
    const gain = randInt(90, 260);
    changeStat("money", gain, deltas);
    changeStat("virtue", -randInt(4, 9), deltas);
    state.jianghu.heat = clamp(state.jianghu.heat + 22);
    return finishAction("假差巡街", `你穿官差衣冠在码头“查验”，商户不敢细问，奉上 ${moneyText(gain)} 求个清静。`, deltas, "Official");
  }
}

function buyJianghuCostume() {
  if (state.inventory.includes("官差衣冠") || state.stats.money < 180) return;
  const deltas = [];
  changeStat("money", -180, deltas);
  addInventoryItem("官差衣冠", deltas);
  finishAction("购得旧衣冠", "旧货商从箱底取出一身退役差人的衣冠，腰牌却是仿制品。", deltas, "Official");
}

function startExaminerBribe() {
  const amount = randInt(650, 1800) + officialRankIndex() * 70;
  state.currentEvent = {
    kind: "examinerBribe",
    title: "贡院暗局 · 重金买题",
    content: `夜里，一名自称替江南豪族办事的中间人送来 ${moneyText(amount)}，只求你透露今科题眼。他暗示银票之外，还能替你打通别处门路。`,
    children: [
      { title: "收银卖题", note: `得 ${moneyText(amount)}，大涨贪墨与风声`, content: "你默写题眼交给中间人，又收下没有落款的银票。" , amount },
      { title: "设局反查", note: "拒绝交易，可能查出幕后考生", content: "你留下银票拓印，命心腹暗跟中间人，顺藤摸瓜查到数名涉案士子。", amount: 0 },
      { title: "焚信拒见", note: "保全清名，但得罪暗中势力", content: "你把来信投入灯火，只让门房回一句贡院无私门。", amount: 0 },
    ],
  };
  save();
  render();
}

function resolveExaminerBribe(choice) {
  const deltas = [];
  if (choice.amount) {
    changeStat("money", choice.amount, deltas);
    changeStat("virtue", -randInt(8, 16), deltas);
    state.official.corruption = clamp(Number(state.official.corruption || 0) + randInt(12, 24), -100, 100);
    state.underworld.heat = clamp(state.underworld.heat + randInt(28, 45));
    state.underworld.records.soldQuestions += 1;
    if (Math.random() < 0.45) state.underworld.extortion = { amount: randInt(420, 950), dueYear: state.year + 1, name: "买题豪族" };
  } else if (/反查/.test(choice.title)) {
    state.official.merit += randInt(35, 75);
    state.official.clean = clamp(Number(state.official.clean || 0) + 8, -100, 100);
    changeStat("favorability", randInt(3, 7), deltas);
  } else {
    state.official.clean = clamp(Number(state.official.clean || 0) + 4, -100, 100);
    changeStat("virtue", 4, deltas);
  }
  state.currentEvent = null;
  state.lastDeltas = deltas;
  addLog("贡院暗局", choice.content, deltas);
  state.eventResult = { title: choice.title, text: choice.content, deltas, icon: "Official", scene: "seal" };
  save();
  render();
}

function startMysteryCase() {
  if (state.mystery.active || state.age < 16 || state.dead || state.prisonYears > 0 || state.currentEvent || state.eventResult) return;
  const available = MYSTERY_CASES.filter((item) => !state.mystery.completed.some((done) => done.caseId === item.id));
  const item = sample(available.length ? available : MYSTERY_CASES);
  state.mystery.active = { caseId: item.id, round: 0, clues: [], actionsUsed: [], role: state.career && careerKind(state.career) === "official" ? "official" : "civilian" };
  state.currentEvent = null;
  state.eventResult = null;
  view.page = "mystery";
  save();
  render();
}

function resumeMysteryCase() {
  if (!state?.mystery?.active) return;
  view.page = "mystery";
  view.overlay = "";
  save();
  render();
}

function activeMysteryCase() {
  return MYSTERY_CASES.find((item) => item.id === state.mystery?.active?.caseId) || null;
}

function investigateMystery(action) {
  const active = state.mystery?.active;
  const item = activeMysteryCase();
  if (!active || !item || active.actionsUsed.includes(action) || active.round >= 4) return;
  const labels = { autopsy: "验尸", witness: "问证人", scene: "搜查现场", records: "查阅旧卷" };
  active.actionsUsed.push(action);
  active.clues.push({ action, label: labels[action], text: item.clues[action] });
  active.round += 1;
  const deltas = [];
  if (action === "autopsy") changeStat("knowledge", randInt(1, 3), deltas);
  if (action === "witness") changeStat("eq", randInt(1, 3), deltas);
  if (action === "scene") changeStat("physique", randInt(-1, 2), deltas);
  if (action === "records") changeStat("knowledge", randInt(1, 3), deltas);
  state.lastDeltas = deltas;
  save();
  render();
}

function accuseMystery(suspectId) {
  const active = state.mystery?.active;
  const item = activeMysteryCase();
  if (!active || !item || active.clues.length < 3) return;
  const suspect = item.suspects.find(([id]) => id === suspectId);
  if (!suspect) return;
  const correct = suspectId === item.guilty;
  const officialInvestigator = active.role !== "civilian" && state.career && careerKind(state.career) === "official";
  const deltas = [];
  if (correct) {
    if (officialInvestigator) {
      state.official.merit += randInt(90, 180);
      state.official.records.cases += 1;
      deltas.push({ label: "政绩", value: "+90以上" });
    } else {
      const reward = randInt(120, 360);
      changeStat("money", reward, deltas);
      addLedger("协破奇案", reward, `协助查破${item.title}所得赏银。`);
    }
    changeStat("favorability", randInt(6, 12), deltas);
    changeStat("virtue", randInt(3, 7), deltas);
  } else {
    if (officialInvestigator) state.official.merit = Math.max(0, state.official.merit - randInt(45, 100));
    else changeStat("money", -Math.min(state.stats.money, randInt(30, 100)), deltas);
    changeStat("favorability", -randInt(5, 12), deltas);
    changeStat("virtue", -randInt(7, 14), deltas);
  }
  const text = correct ? `你以${active.clues.map((clue) => clue.label).join("、")}所得线索层层对证，最终指认${suspect[1]}。真凶无法自圆其说，奇案告破。${officialInvestigator ? "此案被写入你的官府政绩。" : "官府依约发下赏银，市井开始传你的断案名声。"}` : `你指认${suspect[1]}，但关键证据彼此冲突。真正的凶手借机脱身，这桩错案成为${officialInvestigator ? "你官声上的污点" : "坊间嘲讽你的谈资"}。`;
  state.mystery.completed.push({ caseId: item.id, title: item.title, correct, accused: suspect[1], year: state.year });
  state.mystery.active = null;
  view.page = "main";
  state.lastDeltas = deltas;
  addLog(`奇案 · ${item.title}`, text, deltas);
  state.eventResult = { title: `${item.title} · ${correct ? "真相大白" : "铸成错案"}`, text, deltas, icon: correct ? "Official" : "PrisonHeader", scene: "seal" };
  save();
  render();
}

function openExamUnderworld() {
  if (state.age < MAIN_EXAM_MIN_AGE || state.dead || state.prisonYears > 0) return;
  state.underworld = normalizeUnderworld(state.underworld);
  if (!state.underworld.broker) state.underworld.broker = { name: sample(["铁算盘", "陆三眼", "贡院鼠", "白纸扇"]), trust: randInt(28, 72), lastYear: state.year };
  view.page = "examUnderworld";
  save();
  render();
}

function canUseExamCheat(method) {
  if (!method || state.stats.money < method.cost || state.exam.current || examTakenThisYear() || state.exam.rank >= EXAM_STAGES.length - 1) return false;
  if (method.requireExaminer && !(state.stats.relationship >= 70 || state.friends.some((item) => /考官|学政|官员/.test(item.relation || "")))) return false;
  return true;
}

function prepareExamCheat(id) {
  const method = EXAM_CHEAT_METHODS.find((item) => item.id === id);
  if (!canUseExamCheat(method)) return;
  const deltas = [];
  changeStat("money", -method.cost, deltas);
  changeStat("virtue", -randInt(2, method.severe ? 9 : 5), deltas);
  state.underworld.heat = clamp(state.underworld.heat + method.heat);
  const genuine = method.id !== "buyExam" || Math.random() < (0.42 + Number(state.underworld.broker?.trust || 45) / 220);
  state.underworld.activeCheat = { id: method.id, genuine, boughtYear: state.year };
  state.underworld.records.attempts += 1;
  addLedger("科场暗门", -method.cost, `筹备${method.name}。`);
  finishAction("暗局已定", `你通过${state.underworld.broker?.name || "中间人"}布置了“${method.name}”。银钱已经交割，真假成败只有入场后才知道。`, deltas, "PrisonHeader");
}

function examCheatResolution(stage, current, score, passed) {
  const active = state.underworld?.activeCheat;
  if (!active || current.extraType) return { score, passed, prefix: "", detected: false };
  const method = EXAM_CHEAT_METHODS.find((item) => item.id === active.id);
  if (!method) return { score, passed, prefix: "", detected: false };
  const detectionChance = clamp(method.risk + state.underworld.heat * 0.22 - state.stats.eq * 0.08, 4, 72) / 100;
  const detected = Math.random() < detectionChance;
  state.underworld.activeCheat = null;
  if (detected) {
    state.underworld.records.exposed += 1;
    state.underworld.heat = clamp(state.underworld.heat + 24);
    changeStat("favorability", -randInt(8, 18));
    changeStat("virtue", -randInt(5, 12));
    if (method.severe) {
      imposePrisonSentence(randInt(3, 7), `科举${method.name}舞弊`);
      if (!state.tags.includes("科场案犯")) state.tags.push("科场案犯");
      for (const child of livingChildren()) child.affection = clamp(child.affection - randInt(3, 10));
    }
    return { score: 0, passed: false, detected: true, prefix: `搜检官当场查出你以“${method.name}”舞弊，试卷作废，革去资格。${method.severe ? "冒名重罪牵连门户，你被押入牢中。" : "贡院将你的姓名记入黜籍。"} ` };
  }
  let nextScore = score;
  let nextPassed = passed;
  let prefix = "";
  if (method.id === "buyExam" && !active.genuine) {
    nextScore = Math.max(0, score - 4);
    nextPassed = false;
    prefix = `中介给你的所谓“真题”全是伪造，放榜后${state.underworld.broker?.name || "中介"}还托人嘲笑你贪捷径。 `;
    if (state.underworld.broker) state.underworld.broker.trust = clamp(state.underworld.broker.trust - 25);
  } else if (method.boost >= 99) {
    nextScore = current.type === "choice" ? current.questions.length : 96;
    nextPassed = true;
    prefix = method.id === "buyExam" ? "中介所售竟是真题，你在考场落笔如有神助，名次直入前列。 " : `${method.name}的暗线顺利运转，你的卷子被稳稳送进取中之列。 `;
  } else {
    nextScore = current.type === "choice" ? Math.min(current.questions.length, score + method.boost) : Math.min(100, score + method.boost * 8);
    nextPassed = nextScore >= stage.pass;
    prefix = `${method.name}替你补上了最要紧的几处缺口。 `;
  }
  state.underworld.records.successes += nextPassed ? 1 : 0;
  if (method.extortion && Math.random() < method.extortion) state.underworld.extortion = { amount: randInt(180, 520), dueYear: state.year + 1, name: "递卷书吏" };
  return { score: nextScore, passed: nextPassed, detected: false, prefix };
}

function startExam() {
  if (!canOpenExam()) return;
  const stageIndex = Math.min(state.exam.rank + 1, EXAM_STAGES.length - 1);
  const stage = EXAM_STAGES[stageIndex];
  markExamAttempt();
  if (stage.type === "palace") {
    const topic = sample(palaceQuestionPool()) || normalizePalaceTopic(SUPPLEMENTAL_PALACE_TOPICS[0]);
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
  return [...(DATA.database?.questions?.palace || []), ...SUPPLEMENTAL_PALACE_TOPICS].map(normalizePalaceTopic).filter((topic) => topic.themes.length && topic.writingStyles.length);
}

function normalizePalaceTopic(item = {}) {
  const themes = Array.isArray(item.themes) ? item.themes : Array.isArray(item.theme) ? item.theme : [];
  const writingStyles = Array.isArray(item.writingStyles) ? item.writingStyles : Array.isArray(item.styles) ? item.styles : Array.isArray(item.style) ? item.style : [];
  return {
    ...item,
    topic: item.topic || item.title || "策问",
    prompt: item.prompt || item.content || "主考官命你立意成文。",
    themes,
    writingStyles,
  };
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
    const topic = normalizePalaceTopic(current.topic || sample(palaceQuestionPool()) || SUPPLEMENTAL_PALACE_TOPICS[0]);
    const knowledgeScore = Math.round((state.stats.knowledge || 0) * 0.55);
    const eqScore = Math.round((state.stats.eq || 0) * 0.25);
    const virtueScore = Math.round((state.stats.virtue || 0) * 0.2);
    score = clamp(knowledgeScore + eqScore + virtueScore + Math.min(12, prepBonus * 2) + randInt(-8, 12), 0, 100);
    passed = score >= stage.pass;
    const resultText = topic.result || (Array.isArray(topic?.resultDescription?.[0]) ? topic.resultDescription[0].slice(0, 4).join("，") : "文理清通，颇得考官青眼");
    text = `${stage.name}策问「${topic.topic || "治世之道"}」，取${current.theme || "治国"}为旨，行文${current.writingStyle || "堂堂正正"}。${resultText}。${prepBonus ? "考前积累也添了几分底气。" : ""}评分 ${score}，${passed ? "金榜题名" : "仍待来年"}。`;
  }

  const cheatResolution = examCheatResolution(stage, current, score, passed);
  score = cheatResolution.score;
  passed = cheatResolution.passed;
  if (cheatResolution.prefix) text = `${cheatResolution.prefix}最终${stage.name}${passed ? `取中${stage.title}` : "名落孙山"}，计分 ${score}。`;

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

function conditionsPass(conditions, options = {}) {
  for (const cond of conditions || []) {
    const name = cond.name || "";
    if (name === "GetProbability") {
      if (options.ignoreProbability) continue;
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
    selector: ".play-card, .talent-card, .goal-card, .codex-item, .achievement-toast, .question-card, .exam-picks, .prep-panel, .record-item, .person-card, .item-card, .shop-block",
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
            <button class="shortcut-btn ${item.featured ? "featured-shortcut" : ""}" data-shortcut="${item.id}" title="${escapeHtml(item.label)}">
              ${icon(item.icon, item.label)}
              <span>${escapeHtml(item.label)}</span>
              ${item.id === "secrets" && state.age >= 15 && secretLineNoticeCount() ? `<b class="shortcut-notice">${secretLineNoticeCount()}</b>` : ""}
            </button>`).join("")}
        </div>
      </header>

      <section class="status-strip">
        ${resourcePill("钱财", moneyText(state.stats.money, { compact: true }))}
        ${resourcePill("营生", currentCareerName() || "无")}
        ${(Number(state.underworld?.heat || 0) + Number(state.jianghu?.heat || 0)) > 0 ? resourcePill("风声", Math.round(Number(state.underworld?.heat || 0) + Number(state.jianghu?.heat || 0)), "bad") : ""}
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
      ${achievementToast()}
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
  const title = currentCareerName() || (state.exam.rank >= 0 ? EXAM_TITLES[state.exam.rank] : "布衣");
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
        ${(state.pendingSurprise || {}).secretOffer
          ? `<div class="main-actions"><button class="primary-btn" data-action="accept-secret">接下暗事</button><button class="ghost-btn" data-action="decline-secret">婉拒</button></div>`
          : `<button class="primary-btn" data-action="close-surprise">确定</button>`}
      </article>
    </section>`;
}

function achievementToast() {
  const item = state.pendingAchievement;
  if (!item) return "";
  const tier = item.tier || "bronze";
  const meta = ACHIEVEMENT_TIERS[tier] || ACHIEVEMENT_TIERS.bronze;
  return `
    <aside class="achievement-toast ${tier}" role="status" aria-live="polite">
      <div class="achievement-medal">${icon(item.icon || "MainBook", item.title || "成就")}</div>
      <div class="achievement-copy">
        <span>${escapeHtml(meta.name)}解锁${item.count > 1 ? ` · 另有 ${item.count - 1} 项` : ""}</span>
        <strong>${escapeHtml(item.title || "新成就")}</strong>
        <small>${escapeHtml(item.desc || "命册图鉴已记录。")}</small>
      </div>
      <div class="achievement-actions">
        <button class="ghost-btn" data-action="open-achievement-codex">图鉴</button>
        <button class="primary-btn" data-action="close-achievement">收下</button>
      </div>
    </aside>`;
}

function centerContent() {
  if (state.dead) return deathView();
  // 奇案仅在明确进入办案页时全屏，不再永久挡住「下一年」
  if (state.mystery?.active && view.page === "mystery") return mysteryCaseView();
  if (state.pendingTravel) return travelRunView();
  if (state.pendingCaravan) return caravanRunView();
  if (state.eventResult) return eventResultView();
  if (state.currentEvent) return eventView(state.currentEvent);
  // 文斗是一个需要明确作答或弃局的流程，避免从顶部导航离开后留下幽灵局面。
  if (state.poetryRound) return poetryView();
  if (view.page === "home") return homeView();
  if (view.page === "place") return placeView();
  if (view.page === "assets") return assetsView();
  if (view.page === "relations") return relationsView();
  if (view.page === "travel") return travelView();
  if (view.page === "backpack") return backpackView();
  if (view.page === "ledger") return ledgerView();
  if (view.page === "menu") return menuView();
  if (view.page === "save-manager") return saveManagerView();
  if (view.page === "poetry") return poetryView();
  if (view.page === "matchmaker") return matchmakerView();
  if (view.page === "codex") return codexView();
  if (view.page === "culture") return cultureView();
  if (view.page === "world") return worldView();
  if (view.page === "gamble") return gambleView();
  if (view.page === "miniGames") return miniGamesView();
  if (view.page === "courtesanContest") return courtesanContestView();
  if (view.page === "courtesanParlor") return courtesanParlorView();
  if (view.page === "activity") return activityView();
  if (view.page === "exam") return examView();
  if (view.page === "examUnderworld") return examUnderworldView();
  if (view.page === "jianghu") return jianghuView();
  if (view.page === "secrets") return secretsView();
  return overviewView();
}

function secretLineNoticeCount() {
  let count = 0;
  if (!state.secretLines?.seenHub && state.age >= 15) count += 1;
  if (state.underworld?.activeCheat || state.underworld?.extortion) count += 1;
  if (state.mystery?.active) count += 1;
  if (state.jianghu?.prophecy || state.jianghu?.pursuit || state.jianghu?.enabledQian) count += 1;
  return count;
}

function openSecretHub() {
  state.secretLines = normalizeSecretLinesState(state.secretLines, state.age);
  state.secretLines.seenHub = true;
  state.secretLines.introduced = state.secretLines.introduced || state.age >= 15;
  state.secretLines.legacyEligible = false;
  state.secretLines.lastVisitedYear = state.year;
  view.page = "secrets";
  view.placeId = "";
  save();
  render();
}

function secretLineSummary() {
  const cheat = EXAM_CHEAT_METHODS.find((item) => item.id === state.underworld?.activeCheat?.id);
  const activeCase = activeMysteryCase();
  const learned = state.jianghu?.skills?.length || 0;
  return {
    exam: cheat ? `已布置“${cheat.name}”` : state.underworld?.records?.attempts ? `暗试 ${state.underworld.records.attempts} 次` : "五种门路待选择",
    mystery: activeCase ? `${activeCase.title} · ${state.mystery.active.clues.length}/4 线索` : state.mystery?.completed?.length ? `已结 ${state.mystery.completed.length}/6 案` : "六宗奇案待开卷",
    jianghu: state.jianghu?.prophecy ? `${Math.max(0, state.jianghu.prophecy.dueYear - state.year)} 年后卦应` : learned ? `已习 ${learned}/5 门奇术` : "拜师学习五门奇术",
  };
}

function secretPulseView() {
  if (state.age < 14) return "";
  const summary = secretLineSummary();
  const locked = state.age < 15;
  return `
    <section class="secret-pulse ${locked ? "locked" : ""}">
      <div class="secret-pulse-mark">${icon("PrisonHeader", "奇闻暗线")}</div>
      <div class="secret-pulse-copy">
        <span class="secret-kicker">${locked ? "城中传闻 · 尚未成丁" : "黑帖已至 · 三线并行"}</span>
        <h3>${locked ? "十五岁后，明路之外还有另一座城" : "科场暗局、离奇案件、江湖奇术"}</h3>
        <div class="secret-pulse-status"><span>${escapeHtml(summary.exam)}</span><span>${escapeHtml(summary.mystery)}</span><span>${escapeHtml(summary.jianghu)}</span></div>
      </div>
      <button class="${locked ? "ghost-btn" : "primary-btn"}" data-action="open-secrets" ${locked ? "disabled" : ""}>${locked ? "15 岁解锁" : "展开黑帖"}</button>
      ${!locked && secretLineNoticeCount() ? `<b class="secret-notice">${secretLineNoticeCount()}</b>` : ""}
    </section>`;
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

function prisonOverviewView() {
  const prison = ensurePrisonState();
  const served = prison.yearsServed;
  const total = Math.max(prison.totalYears, served + state.prisonYears);
  const records = prison.records.slice(0, 4);
  const metric = (label, value, note) => `
    <article class="prison-metric">
      <span>${escapeHtml(label)}</span><strong>${Math.round(value)}</strong>
      <div class="meter"><i style="width:${clamp(value)}%"></i></div>
      <small>${escapeHtml(note)}</small>
    </article>`;
  return `
    <article class="play-card prison-dashboard">
      <div class="prison-hero">
        <div>${icon("PrisonHeader", "牢狱")}</div>
        <section>
          <p class="eyebrow">牢狱生涯 · 第 ${served + 1} 年将至</p>
          <h2>铁窗之内，日子仍在向前</h2>
          <p>${prison.lastReason ? `因「${escapeHtml(prison.lastReason)}」获罪。` : "案牍已经封存。"}余刑 <b>${state.prisonYears}</b> 年，原判与加减刑合计按 ${total} 年计。</p>
        </section>
      </div>
      <div class="prison-people">
        <article><small>同监狱友</small><strong>${escapeHtml(prison.cellmate.name)}</strong><span>${prison.cellmate.age} 岁 · 情分 ${prison.inmateFavor}</span></article>
        <article><small>当值狱卒</small><strong>${escapeHtml(prison.guard.name)}</strong><span>态度 ${prison.guardFavor} · 家书 ${prison.letters} 封</span></article>
      </div>
      <div class="prison-metrics">
        ${metric("狱中声望", Math.max(0, prison.reputation), prison.reputation < 0 ? "处处受人轻看" : prison.reputation > 60 ? "一言颇有分量" : "仍在摸清规矩")}
        ${metric("狱友情分", prison.inmateFavor, "决定互助、联名与出狱故交")}
        ${metric("狱卒态度", prison.guardFavor, "影响家书、冬衣与申诉递送")}
        ${metric("申诉线索", prison.appeal, "秋审据律写状的关键积累")}
        ${metric("劳作熟练", prison.laborSkill, "劳役中保身体、赢考功")}
      </div>
      <p class="prison-advice">在牢中推进一年会先扣除一年刑期，再进入专属剧情；越狱、密告、秋审、家书与狱中人情都会改变余刑和出狱后的关系。</p>
      <div class="main-actions"><button class="primary-btn year-btn" data-action="next-year">熬过这一年</button></div>
    </article>
    <section class="log-preview prison-records">
      <div class="section-title"><h2>铁窗旧事</h2><span>已服 ${served} 年</span></div>
      ${records.map((record) => infoCard(record.title, `${record.choice ? `${record.choice} · ` : ""}${record.text || ""}`)).join("") || `<p class="empty-note">第一年的点名声尚未响起。</p>`}
    </section>`;
}

function cultureView() {
  const calendar = state.culturalCalendar = normalizeCulturalCalendar(state.culturalCalendar);
  const seen = new Set(calendar.seen);
  const typeSeen = (type) => CULTURAL_CALENDAR_ITEMS.filter((item) => item.type === type && seen.has(item.id)).length;
  return `
    <article class="play-card culture-dashboard">
      <p class="eyebrow">华夏岁时 · 文化图鉴</p>
      <h2>观天时，也观人间</h2>
      <p>节气来自对太阳周年运行、物候和农事节律的观察；传统节日则把祭祖、团圆、敬老、祛疫、游春等生活记忆留在一代代人的日常里。不同朝代与地域风俗不尽相同，本图鉴呈现广为流传的共同传统。</p>
      <div class="culture-summary">
        <span><b>${seen.size}/${CULTURAL_CALENDAR_ITEMS.length}</b>岁时见闻</span>
        <span><b>${typeSeen("term")}/24</b>二十四节气</span>
        <span><b>${typeSeen("festival")}/16</b>传统节日</span>
        <span><b>${calendar.familyChoices}</b>次与家人守俗</span>
      </div>
      <div class="culture-season-strip">
        ${Object.entries(CULTURAL_SEASONS).map(([id, season]) => `<span style="--season:${season.color}"><b>${season.name}</b>${season.note}<em>${calendar.seasonCounts[id] || 0} 则</em></span>`).join("")}
      </div>
      <div class="main-actions"><button class="ghost-btn" data-action="back-main">返回流年</button></div>
    </article>
    ${Object.entries(CULTURAL_SEASONS).map(([seasonId, season]) => `
      <section class="culture-season">
        <div class="section-title"><h2>${season.name} · ${season.note}</h2><span>${CULTURAL_CALENDAR_ITEMS.filter((item) => item.season === seasonId && seen.has(item.id)).length}/${CULTURAL_CALENDAR_ITEMS.filter((item) => item.season === seasonId).length}</span></div>
        <div class="culture-grid">
          ${CULTURAL_CALENDAR_ITEMS.filter((item) => item.season === seasonId).map((item) => {
            const unlocked = seen.has(item.id);
            const record = calendar.records[item.id];
            const detail = item.type === "term" ? `${item.phenology}。习俗：${item.customs}；起居：${item.care}。` : `${item.meaning}。习俗：${item.customs}；食俗：${item.food}。`;
            return `<article class="culture-card ${unlocked ? "unlocked" : "locked"}" style="--season:${season.color}">
              <span>${item.type === "term" ? "节气" : "节日"}</span><h3>${escapeHtml(item.name)}</h3>
              <p>${unlocked ? escapeHtml(detail) : "尚未在流年中亲历，风俗条目暂藏。"}</p>
              <small>${unlocked ? `${record?.age ?? "旧年"}岁 · ${escapeHtml(record?.choice || "已有记录")}` : "随岁月解锁"}</small>
            </article>`;
          }).join("")}
        </div>
      </section>`).join("")}`;
}

function worldMetric(label, value, note, danger = false) {
  const level = clamp(Number(value || 0));
  return `<article class="world-metric ${danger ? "danger" : ""}"><span>${escapeHtml(label)}</span><strong>${Math.round(value)}</strong><div class="meter"><i style="width:${danger ? clamp(level) : level}%"></i></div><small>${escapeHtml(note)}</small></article>`;
}

function dominantWorldFaction() {
  const [id, power] = Object.entries(state.dynasty.factions).sort((a, b) => b[1] - a[1])[0] || ["reformers", 0];
  return { id, power, ...(WORLD_FACTIONS[id] || { name: "朝臣", note: "朝局未明" }) };
}

function worldPulseView() {
  const world = state.dynasty;
  const phase = dynastyPhase(world);
  const faction = dominantWorldFaction();
  const arc = world.activeArc ? WORLD_ARCS[world.activeArc.id] : null;
  return `
    <button class="world-pulse" data-door="world">
      <span class="world-seal">${escapeHtml(world.eraName)}</span>
      <span><small>${escapeHtml(world.eraName)}${world.reignYear}年 · ${escapeHtml(phase.name)}</small><strong>${escapeHtml(arc ? `${arc.name} · ${arc.stages[world.activeArc.stage]?.title || "风波未平"}` : world.headline)}</strong></span>
      <em>${escapeHtml(faction.name)} ${faction.power}</em>
    </button>`;
}

function worldView() {
  state.dynasty = normalizeDynastyState(state.dynasty);
  const world = state.dynasty;
  const phase = dynastyPhase(world);
  const temperament = dynastyTemperament();
  const faction = dominantWorldFaction();
  const activeArc = world.activeArc ? WORLD_ARCS[world.activeArc.id] : null;
  return `
    <article class="play-card world-dashboard phase-${phase.id}">
      <div class="world-hero">
        <div class="world-era"><small>年号</small><strong>${escapeHtml(world.eraName)}</strong><span>${world.reignYear} 年</span></div>
        <section><p class="eyebrow">天下风云 · ${escapeHtml(phase.name)}</p><h2>${escapeHtml(world.headline)}</h2><p>${escapeHtml(phase.note)}。当今天子${escapeHtml(world.rulerName)}，${world.rulerAge}岁，性情${escapeHtml(temperament.name)}；${escapeHtml(temperament.note)}。</p></section>
      </div>
      ${activeArc ? `<section class="world-arc-banner"><span>跨年主线 · 第 ${world.activeArc.stage + 1}/${activeArc.stages.length} 幕</span><strong>${escapeHtml(activeArc.name)}：${escapeHtml(activeArc.stages[world.activeArc.stage]?.title || "风波未平")}</strong><small>当前评价 ${world.activeArc.score} · 下一幕${world.activeArc.dueYear <= state.year ? "已经临门" : `${world.activeArc.dueYear - state.year}年后`}</small></section>` : ""}
      <div class="world-metrics">
        ${worldMetric("国力", world.prosperity, "生产、商贸与恢复能力")}
        ${worldMetric("安定", world.stability, "朝廷秩序与地方服从")}
        ${worldMetric("国库", world.treasury, "赈济、军费与工程余力")}
        ${worldMetric("边患", world.borderThreat, "越高越可能触发战争", true)}
        ${worldMetric("贪墨", world.corruption, "越高越容易出现亏空", true)}
      </div>
      <div class="world-local-grid">
        ${worldMetric("粮价", world.local.grainPrice, "100为常年基准", world.local.grainPrice > 120)}
        ${worldMetric("治安", world.local.security, "影响商旅与百姓生活")}
        ${worldMetric("灾情", world.local.disaster, "水旱、火灾与流民风险", true)}
        ${worldMetric("疫病", world.local.epidemic, "医者机会与染病风险", true)}
        ${worldMetric("民心", world.local.sentiment, "地方对官府与秩序的信任")}
      </div>
      <p class="world-career-impact"><b>与你的营生：</b>${escapeHtml(worldCareerImpactText())}</p>
      <div class="main-actions"><button class="ghost-btn" data-action="back-main">返回流年</button></div>
    </article>
    <section class="world-factions">
      <div class="section-title"><h2>朝局四派</h2><span>${escapeHtml(faction.name)}声势最盛</span></div>
      <div>${Object.entries(WORLD_FACTIONS).map(([id, item]) => `<article class="faction-card ${id === faction.id ? "dominant" : ""}"><span>${escapeHtml(item.name)}</span><strong>${world.factions[id]}</strong><div class="meter"><i style="width:${world.factions[id]}%"></i></div><small>${escapeHtml(item.note)}</small></article>`).join("")}</div>
    </section>
    <section class="log-preview world-chronicle">
      <div class="section-title"><h2>天下纪事</h2><span>已历 ${world.successions} 次改元 · 完成 ${world.completedArcs.length}/3 条主线</span></div>
      ${world.history.slice(0, 10).map((item) => infoCard(`${item.year}年 · ${item.title}`, item.text)).join("") || `<p class="empty-note">本朝纪事尚未落笔。</p>`}
    </section>`;
}

function overviewView() {
  if (state.prisonYears > 0) return prisonOverviewView();
  const phase = lifePhase();
  const goals = nextGoals(3);
  const generation = Math.max(1, Number(state.lineage?.generation) || 1);
  const blockReason = yearAdvanceBlockReason();
  const yearBlocked = !!blockReason;
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
      ${yearBlocked ? `<p class="empty-note">${escapeHtml(blockReason)}</p>` : ""}
      ${state.mystery?.active ? `<p class="dark-warning">你手头还有未结奇案「${escapeHtml(activeMysteryCase()?.title || "旧案")}」。可继续查，也可先推进流年。</p><div class="main-actions"><button class="secondary-btn" data-action="resume-mystery">继续办案</button></div>` : ""}
      <div class="main-actions">
        <button class="primary-btn year-btn" data-action="next-year" ${yearBlocked ? "disabled" : ""}>下一年</button>
        <button class="secondary-btn" data-page="place" data-place="activities">安排活动</button>
      </div>
    </article>
    ${worldPulseView()}
    ${secretPulseView()}
    <section class="goal-strip">
      ${goals.map((goal) => `
        <article class="goal-card">
          ${icon(goal.icon, goal.title)}
          <strong>${escapeHtml(goal.title)}</strong>
          <small>${escapeHtml(goal.advice)}</small>
        </article>`).join("") || `<article class="goal-card complete"><strong>成就已满</strong><small>这一世大多经营妥当，继续补足命册即可。</small></article>`}
    </section>
    <section class="door-grid">
      ${MAIN_DOORS.map((door) => `
        <button class="door-btn ${door.featured ? "featured-door" : ""}" data-door="${door.id}">
          ${icon(door.icon, door.label)}
          <span>${escapeHtml(door.label)}</span>
          ${door.id === "world" ? `<small>${escapeHtml(dynastyPhase().name)} · ${state.dynasty?.activeArc ? WORLD_ARCS[state.dynasty.activeArc.id]?.name : `${state.dynasty?.eraName || "本朝"}${state.dynasty?.reignYear || 1}年`}</small>` : ""}
          ${door.id === "secrets" ? `<small>${state.age < 15 ? "15 岁解锁" : secretLineNoticeCount() ? `${secretLineNoticeCount()} 条动静` : "三线总览"}</small>` : ""}
          ${door.id === "culture" ? `<small>${state.culturalCalendar?.seen?.length || 0}/${CULTURAL_CALENDAR_ITEMS.length} 已入册</small>` : ""}
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

function courtesanParlorView() {
  const visit = normalizeCourtesanVisit(state.courtesanVisit);
  if (!visit) {
    return `
      <article class="play-card courtesan-card">
        <p class="eyebrow">瓦舍风月 · 仅限成年</p>
        <h2>美人雅座</h2>
        <p>后楼今夜尚未点灯。入座后可从琴姬、舞姬、诗伎等人中择一作陪。</p>
        <div class="main-actions">
          <button class="primary-btn" data-action="brothel-refresh">请鸨母开席</button>
          <button class="ghost-btn" data-action="back-places">返回瓦舍</button>
        </div>
      </article>`;
  }
  return `
    <article class="play-card courtesan-card brothel-card">
      <div class="courtesan-hero">
        <div>
          <p class="eyebrow">瓦舍风月 · 仅限成年</p>
          <h2>美人雅座</h2>
          <p>先选一位美人，再决定听曲、夜宴或共度良宵。花销越高，欢愉与人情越多，染病、失德和家宅生隙的风险也越大。</p>
        </div>
        <div class="courtesan-preview">
          <span>风月簿</span>
          <strong>${Math.round(state.brothelRecords?.visits || 0)} 次</strong>
          <small>知己 ${(state.brothelRecords?.favorites || []).length} 人</small>
        </div>
      </div>
      <section class="courtesan-list brothel-list">
        ${visit.candidates.map(brothelCompanionCard).join("")}
      </section>
      <div class="main-actions">
        <button class="secondary-btn" data-action="brothel-refresh">换一批美人</button>
        <button class="ghost-btn" data-action="back-places">返回瓦舍</button>
      </div>
    </article>`;
}

function brothelCompanionCard(candidate) {
  const stats = [["才艺", candidate.talent], ["机智", candidate.wit], ["姿容", candidate.looks], ["亲近", candidate.affection]];
  const redeemCost = Math.max(1200, Math.round(candidate.price * 12));
  const redeemReady = candidate.affection >= COURTESAN_REDEEM_AFFECTION && candidate.visits >= COURTESAN_REDEEM_VISITS;
  return `
    <article class="courtesan-person brothel-person">
      <div class="courtesan-avatar">
        <img class="courtesan-portrait" src="${escapeHtml(candidate.portrait)}" alt="${escapeHtml(candidate.name)}" loading="eager">
      </div>
      <div class="courtesan-body">
        <header>
          <div><small>${candidate.age} 岁 · ${escapeHtml(candidate.specialty)}</small><h3>${escapeHtml(candidate.name)}</h3></div>
          <b>起价 ${moneyText(candidate.price)}</b>
        </header>
        <p>${escapeHtml(candidate.background)}</p>
        <p class="courtesan-talent">${escapeHtml(candidate.specialty)} · ${escapeHtml(candidate.specialtyText)}</p>
        <div class="courtesan-bars">${stats.map(([label, value]) => `<span><em>${label}</em><i><b style="width:${clampNumber(value, 0, 100, 0)}%"></b></i><strong>${value}</strong></span>`).join("")}</div>
        <div class="brothel-actions">
          ${Object.entries(BROTHEL_ACTIONS).map(([id, action]) => {
            const cost = Math.max(40, Math.round(candidate.price * action.multiplier));
            return `<button class="text-btn inline-action" data-brothel-action="${id}" data-brothel-id="${escapeHtml(candidate.id)}" ${state.stats.money < cost ? "disabled" : ""}>${escapeHtml(action.label)} · ${moneyText(cost)}</button>`;
          }).join("")}
          <button class="text-btn inline-action" data-redeem-courtesan="${escapeHtml(candidate.id)}" ${!redeemReady || state.stats.money < redeemCost ? "disabled" : ""}>赎身 · ${moneyText(redeemCost)}</button>
        </div>
        <small>已作陪 ${candidate.visits || 0} 次${candidate.visits >= 2 ? " · 风月知己" : ""} · ${redeemReady ? "已愿脱籍，可备赎资" : `好感达 ${COURTESAN_REDEEM_AFFECTION} 且作陪 ${COURTESAN_REDEEM_VISITS} 次可赎身`}</small>
      </div>
    </article>`;
}

function eventResultView() {
  const result = state.eventResult || {};
  const scene = result.scene || activitySceneFor(result.icon, result.title, result.text);
  return `
    <article class="play-card result-card scene-${escapeHtml(scene)}">
      <p class="eyebrow">结果</p>
      <h2>${escapeHtml(result.title || "结果")}</h2>
      <div class="cinematic-stage" aria-hidden="true">
        <span class="scene-orbit orbit-one"></span><span class="scene-orbit orbit-two"></span>
        <span class="scene-particle particle-one"></span><span class="scene-particle particle-two"></span><span class="scene-particle particle-three"></span>
        <div class="result-illustration">${icon(result.icon || "MainBook", result.title || "结果")}</div>
      </div>
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
      ["courtesanParlor", "美人雅座", "18 岁后可入，挑选美人听曲、夜宴或共度良宵", "FlowerChiefTitle", COURTESAN_MIN_AGE],
      ["courtesanContest", "佳丽竞选", "18 岁后可入，赏才问答，评出一夜花魁", "FlowerChiefTitle", COURTESAN_MIN_AGE],
    ],
    temple: [
      ["templePray", "焚香祈福", "添德行、安心绪", "Temple"],
      ["templeDrawLot", "求签问运", "抽取签运，下一流年将出现对应的应验剧情", "Temple"],
    ],
    academy: [
      ["prepareExam", "备考温课", "消耗一年在书院温题，提升备考进度", "Book"],
      ["poetryMeet", "诗会文斗", "12 岁后可入：对上下联，胜涨学识名望，败则出丑", "MainBook", 12],
    ],
    party: [["poetryMeet", "诗会雅集", "赴席对句，一较高下", "MainBook", 12]],
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
                <button class="text-btn inline-action" data-cricket-action="competition" data-cricket-id="${escapeHtml(cricket.id)}" ${locked ? "disabled" : ""}>府城大赛</button>
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
    matchmaker: ["联姻策略局", "细看家世、彩礼、性情与生育预期，再定相看之人。"],
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
  const spouseRelation = state.gender === "male" ? "妻子" : "夫君";
  const spouse = state.family.spouse ? [{ gender: partnerGender, alive: true, ...state.family.spouseMeta, id: "spouse", relation: spouseRelation, name: state.family.spouse, affection: state.family.spouseAffection || state.family.spouseMeta?.affection || 82 }] : [];
  const lover = state.family.lover ? [{ gender: partnerGender, alive: true, affection: 64, ...state.family.loverMeta, id: "lover", relation: "相看之人", name: state.family.lover }] : [];
  const concubines = (state.family.concubines || []).filter((item) => item.alive !== false);
  const concubineCandidate = state.family.concubineCandidate ? [{ ...state.family.concubineCandidate, relation: "待纳侧室" }] : [];
  const children = livingChildren();
  const inlaws = children.map((child) => child.spouse ? { ...child.spouse, relation: child.gender === "female" ? "女婿" : "儿媳", childName: child.name } : null).filter((person) => person && person.alive !== false);
  const grandchildren = livingGrandchildren();
  const formerSpouses = (state.family.spouseHistory || []).map((person) => ({ ...person, relation: "故配", alive: false }));
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
      ${formerSpouses.length ? `<h2 class="subhead">故配</h2><div class="person-list">${formerSpouses.map((person) => personCard(person)).join("")}</div>` : ""}
      ${concubines.length ? `<h2 class="subhead">侧室</h2><div class="person-list">${concubines.map((person) => personCard(person, person.id)).join("")}</div>` : ""}
      ${concubineCandidate.length ? `<h2 class="subhead">媒人名帖</h2><div class="person-list">${concubineCandidate.map((person) => personCard(person)).join("")}</div>` : ""}
      ${children.length ? `<h2 class="subhead">子女</h2><div class="person-list">${children.map(childCard).join("")}</div>` : state.family.spouse ? `<p class="empty-note">尚无子女。</p>` : ""}
      ${inlaws.length ? `<h2 class="subhead">女婿与儿媳</h2><div class="person-list">${inlaws.map((person) => personCard(person)).join("")}</div>` : ""}
      ${grandchildren.length ? `<h2 class="subhead">孙辈</h2><div class="person-list">${grandchildren.map(grandchildCard).join("")}</div>` : ""}
      ${friends.length ? `<h2 class="subhead">友人</h2><div class="person-list">${friends.map((person) => personCard(person, person.id)).join("")}</div>` : ""}
      <div class="main-actions">
        <button class="secondary-btn" data-action="send-letter">发送书信</button>
        ${state.family.lover && !state.family.spouse ? `<button class="primary-btn" data-action="marry-lover" ${state.age < 16 ? "disabled" : ""}>成婚</button>` : ""}
        ${state.family.concubineCandidate ? `<button class="primary-btn" data-action="take-concubine" ${state.age < 18 || state.stats.money < 220 ? "disabled" : ""}>纳入侧室 · ${moneyText(220)}</button>` : ""}
        <button class="ghost-btn" data-action="back-main">返回</button>
      </div>
    </article>`;
}

function childCard(child) {
  const affection = clamp(Number(child.affection ?? 70));
  const physique = Math.round(Number(child.physique ?? 0));
  return `
    <article class="person-card">
      <div class="person-avatar ${child.gender === "female" ? "female" : ""}">${icon(relativeAvatarIcon(child), child.relation)}</div>
      <div>
        <strong><span>${escapeHtml(child.relation || "子女")} · ${child.age}岁</span>${escapeHtml(child.name || "无名")}</strong>
        <div class="meter"><i style="width:${affection}%"></i></div>
        <small>${escapeHtml(child.trait || "聪慧")} · 体魄 ${physique} · 学业 ${Math.round(child.study || 0)} · 德行 ${Math.round(child.virtue || 0)}${child.age >= 15 ? ` · ${escapeHtml(child.occupation || "尚未谋业")} · 志向“${escapeHtml(child.ambition || "求安稳")}”` : ""}${child.otherParent ? ` · 生母/父 ${escapeHtml(child.otherParent)}` : ""}${child.spouse ? ` · 已与${escapeHtml(child.spouse.name)}成婚` : child.marriedTo ? ` · 已与${escapeHtml(child.marriedTo)}成婚` : ""}${(child.grandchildren || []).length ? ` · 子女 ${(child.grandchildren || []).filter((item) => item.alive !== false).length} 人` : ""}${childEducationLabel(child) ? ` · ${escapeHtml(childEducationLabel(child))}` : ""}${familyStoryStatus(child)}</small>
        ${child.lastAction ? `<small class="npc-memory">近年动向：${escapeHtml(child.lastAction)}${child.memories?.[0]?.text ? ` · 记得“${escapeHtml(child.memories[0].text)}”` : ""}</small>` : ""}
        <span class="mini-actions">
          ${child.age < 15 ? `<button class="text-btn inline-action" data-teach-child="${escapeHtml(child.id)}" ${state.stats.money < CHILD_EDU_COST ? "disabled" : ""}>延师教养</button>` : `<small>已成丁，可承继家业。</small>`}
          ${child.age >= CHILD_MARRIAGE_AGE && !child.spouse ? `<button class="text-btn inline-action" data-marry-child="${escapeHtml(child.id)}" ${state.stats.money < CHILD_MARRIAGE_COST ? "disabled" : ""}>操办婚事 · ${moneyText(CHILD_MARRIAGE_COST)}</button>` : ""}
          ${relationActionButtons(child.id)}
        </span>
      </div>
    </article>`;
}

function grandchildCard(grandchild) {
  return `
    <article class="person-card">
      <div class="person-avatar ${grandchild.gender === "female" ? "female" : ""}">${icon(relativeAvatarIcon(grandchild), grandchild.relation)}</div>
      <div>
        <strong><span>${escapeHtml(grandchild.relation)} · ${grandchild.age}岁</span>${escapeHtml(grandchild.name)}</strong>
        <div class="meter"><i style="width:${clamp(Number(grandchild.affection ?? 70))}%"></i></div>
        <small>${escapeHtml(grandchild.trait || "聪慧")} · 体魄 ${Math.round(grandchild.physique || 0)} · 学业 ${Math.round(grandchild.study || 0)} · 父母 ${escapeHtml(grandchild.parentName || "家中子女")}${grandchild.age >= 15 ? " · 可承继家业" : ""}</small>
      </div>
    </article>`;
}

function personCard(person, targetId = "") {
  const affection = clamp(Number(person.affection ?? (person.relation === "友人" ? 48 : 78)));
  const ageText = Number.isFinite(Number(person.age)) ? ` · ${Math.round(Number(person.age))}岁` : "";
  const physiqueText = Number.isFinite(Number(person.physique)) ? ` · 体魄 ${Math.round(Number(person.physique))}` : "";
  const debtText = person.debt ? ` · 欠情 ${moneyText(person.debt)}` : "";
  const agencyText = person.alive === false ? "" : ` · ${person.occupation || "料理家业"} · ${person.disposition || "重情"} · 志向“${person.ambition || "求安稳"}”${person.marriedTo ? ` · 已与${person.marriedTo}成婚` : ""}`;
  const statusText = person.alive === false ? `已故${ageText}` : `${relationLabel(affection)}${ageText}${physiqueText}${debtText}${agencyText}${partnerStatusText(person)}${familyStoryStatus(person)}`;
  return `
    <article class="person-card">
      <div class="person-avatar ${person.gender === "female" ? "female" : ""}">${icon(relativeAvatarIcon(person), person.relation)}</div>
      <div>
        <strong><span>${escapeHtml(person.relation || "亲友")}</span>${escapeHtml(person.name || "无名")}</strong>
        <div class="meter"><i style="width:${affection}%"></i></div>
        <small>${escapeHtml(statusText)}</small>
        ${person.lastAction ? `<small class="npc-memory">近年动向：${escapeHtml(person.lastAction)}${person.memories?.[0]?.text ? ` · 记得“${escapeHtml(person.memories[0].text)}”` : ""}</small>` : ""}
        ${person.alive === false || !targetId ? "" : `<span class="mini-actions">${relationActionButtons(targetId)}</span>`}
      </div>
    </article>`;
}

function relativeAvatarIcon(person = {}) {
  const relation = String(person.relation || "");
  if (relation === "父亲") return "FamilyFatherAvatar";
  if (relation === "母亲") return "FamilyMotherAvatar";
  if (["哥哥", "弟弟", "兄长"].includes(relation)) return "FamilyBrotherAvatar";
  if (["姐姐", "妹妹", "姊妹"].includes(relation)) return "FamilySisterAvatar";
  if (relation === "儿子") return "FamilySonAvatar";
  if (relation === "女儿") return "FamilyDaughterAvatar";
  if (relation === "孙子") return "FamilySonAvatar";
  if (relation === "孙女") return "FamilyDaughterAvatar";
  if (relation === "儿媳") return "FamilyWifeAvatar";
  if (relation === "女婿") return "FamilyHusbandAvatar";
  if (relation === "故配") return person.gender === "male" ? "FamilyHusbandAvatar" : "FamilyWifeAvatar";
  if (relation === "友人") return "FamilyFriendAvatar";
  if (["妻子", "配偶"].includes(relation) && person.gender !== "male") return "FamilyWifeAvatar";
  if (relation === "妾室") return "FamilyConcubineAvatar";
  if (["待纳侧室", "相看之人", "花魁知己"].includes(relation) && person.gender !== "male") return "FamilyBetrothedAvatar";
  if (relation === "夫君" || (relation === "配偶" && person.gender === "male")) return "FamilyHusbandAvatar";
  if (person.gender === "female") return "FamilySisterAvatar";
  if (person.gender === "male") return "FamilyBrotherAvatar";
  return "FamilyFriendAvatar";
}

function relationActionButtons(targetId) {
  const partner = targetId === "spouse" || (state.family.concubines || []).some((item) => item.id === targetId);
  const lover = targetId === "lover";
  const allowed = partner ? ["talk", "outing", "gift", "care", "intimate"] : lover ? ["visit", "gift"] : ["visit", "gift", "borrow", "care"];
  const target = partner ? findRelationTarget(targetId) : null;
  return Object.entries(RELATION_ACTIONS)
    .filter(([id]) => allowed.includes(id))
    .map(([id, item]) => {
      const intimateLocked = id === "intimate" && (state.age < 18 || Number(target?.person?.affection || 0) < 25);
      return `<button class="text-btn inline-action" data-relation-action="${id}" data-relation-target="${escapeHtml(targetId)}" ${intimateLocked || (item.cost && state.stats.money < item.cost) ? "disabled" : ""}>${escapeHtml(item.label)}</button>`;
    })
    .join("");
}

function partnerStatusText(person) {
  if (!["妻子", "夫君", "妾室", "配偶"].includes(person.relation)) return "";
  const intimacy = Math.round(Number(person.intimacy || 0));
  const last = Number(person.lastIntimateYear) >= 0 ? ` · 上次同房 ${Math.round(person.lastIntimateYear)}岁` : "";
  const jealousy = Number(person.jealousy || 0) >= 35 ? " · 心有妒意" : "";
  return ` · 亲密 ${intimacy}${last}${jealousy}`;
}

function relationLabel(value) {
  if (value >= 80) return "亲密";
  if (value >= 55) return "融洽";
  if (value >= 30) return "平淡";
  return "不睦";
}

function travelView() {
  const locked = state.age < 6 || state.prisonYears > 0 || !!state.pendingCaravan;
  state.travelSystem = normalizeTravelSystem(state.travelSystem);
  state.travelCodex = normalizeTravelCodex(state.travelCodex);
  const unlockedLandmarks = new Set(state.travelCodex.unlocked);
  const selected = travelDestinationById();
  const carriage = travelCarriage();
  const supply = travelSupply();
  const companions = travelCompanions();
  const selectedCompanion = companions.find((item) => item.id === state.travelSystem.companionId) || companions[0];
  const cost = travelTripCost(selected);
  const nextCarriage = TRAVEL_CARRIAGES[state.travelSystem.carriageLevel];
  const repairCost = Math.max(20, Math.round((100 - state.travelSystem.condition) * 1.6));
  return `
    <article class="play-card travel-card travel-hub">
      <header class="travel-hero">
        <div><p class="eyebrow">车马 · 山河游历</p><h2>从${escapeHtml(state.location)}启程</h2><p>${locked ? "年岁尚幼或身不由己，暂不可远行。" : "选路线、约旅伴、备行囊。途中会遇见不同事件，抵达后还可游览、访友或采买风物。"}</p></div>
        <div class="travel-passport"><span>游历印记</span><strong>${state.travelSystem.stamps.length}/${TRAVEL_DESTINATIONS.length}</strong><small>累计 ${state.travelSystem.totalTrips} 次远游</small></div>
      </header>

      <section class="carriage-garage">
        <div class="carriage-icon">${icon(carriage.icon, carriage.name)}</div>
        <div><span>当前座驾 · ${carriage.level}级</span><h3>${escapeHtml(carriage.name)}</h3><p>${escapeHtml(carriage.note)}</p></div>
        <div class="carriage-condition"><b>车况 ${Math.round(state.travelSystem.condition)}</b><div class="meter"><i style="width:${state.travelSystem.condition}%"></i></div><small>舒适 +${carriage.comfort} · 安全 +${carriage.safety}</small></div>
        <div class="mini-actions">
          <button class="text-btn inline-action" data-travel-upgrade="repair" ${state.travelSystem.condition >= 96 || state.stats.money < repairCost ? "disabled" : ""}>修整 · ${moneyText(repairCost)}</button>
          ${nextCarriage ? `<button class="text-btn inline-action" data-travel-upgrade="upgrade" ${state.stats.money < nextCarriage.price ? "disabled" : ""}>换${escapeHtml(nextCarriage.name)} · ${moneyText(nextCarriage.price)}</button>` : `<small>已是最高规格车马</small>`}
        </div>
      </section>

      <section class="travel-section">
        <div class="section-title"><h2>一、择一条路线</h2><small>熟悉同一路线可逐渐减免路资</small></div>
        <div class="travel-map">
          ${TRAVEL_DESTINATIONS.map((item, index) => {
            const memory = state.travelSystem.memories[item.id];
            const active = item.id === selected.id;
            return `<button class="travel-destination ${active ? "active" : ""} ${state.travelSystem.stamps.includes(item.id) ? "visited" : ""}" data-travel="${index}" ${locked ? "disabled" : ""}>
              <span class="destination-icon">${icon(item.icon, item.name)}</span>
              <strong>${escapeHtml(item.name)}</strong>
              <small>${item.days}日路程 · 风险 ${item.risk}</small>
              <em>${escapeHtml(item.landmark)}</em>
              ${memory.trips ? `<b>已游 ${memory.trips} 次</b>` : ""}
            </button>`;
          }).join("")}
        </div>
        <div class="selected-route-card">
          <div>${icon(selected.icon, selected.name)}<span><b>${escapeHtml(selected.name)} · ${escapeHtml(selected.landmark)}</b><small>${escapeHtml(selected.story)}</small></span></div>
          <p>${escapeHtml(selected.note)} · 基础路资 ${moneyText(selected.cost)} · 预计 ${selected.days} 日</p>
        </div>
      </section>

      <section class="travel-section">
        <div class="section-title"><h2>二、约一位旅伴</h2><small>旅伴会提高途中应对，并增进关系</small></div>
        <div class="travel-option-grid companion-grid">${companions.map((item) => `<button class="travel-option ${item.id === selectedCompanion.id ? "active" : ""}" data-travel-companion="${escapeHtml(item.id)}"><b>${escapeHtml(item.name)}</b><span>${escapeHtml(item.relation)} · 照应 +${item.bonus}</span><small>${escapeHtml(item.note)}</small></button>`).join("")}</div>
      </section>

      <section class="travel-section">
        <div class="section-title"><h2>三、备好行囊</h2><small>行囊影响安全、舒适与总路资</small></div>
        <div class="travel-option-grid">${TRAVEL_SUPPLIES.map((item) => `<button class="travel-option ${item.id === supply.id ? "active" : ""}" data-travel-supply="${item.id}"><b>${escapeHtml(item.name)} · ${moneyText(item.cost)}</b><span>安全 +${item.safety} · 舒适 +${item.comfort}</span><small>${escapeHtml(item.note)}</small></button>`).join("")}</div>
      </section>

      <section class="travel-section travel-codex-section">
        <div class="section-title"><h2>旅中奇遇图鉴</h2><small>已收录 ${unlockedLandmarks.size}/${TRAVEL_LANDMARKS.length} 处；远游、游学与押镖均可解锁</small></div>
        <div class="travel-codex-grid">
          ${TRAVEL_LANDMARKS.map((item) => {
            const unlocked = unlockedLandmarks.has(item.id);
            return `<article class="travel-codex-item ${unlocked ? "unlocked" : "locked"}"><b>${unlocked ? escapeHtml(item.name) : "未识之地"}</b><small>${unlocked ? escapeHtml(item.note) : "沿山河继续寻访"}</small></article>`;
          }).join("")}
        </div>
      </section>

      <footer class="travel-departure">
        <div><span>本次计划</span><strong>${escapeHtml(state.location)} → ${escapeHtml(selected.name)}</strong><small>${escapeHtml(selectedCompanion.name)}同行 · ${escapeHtml(supply.name)} · 共需 ${moneyText(cost)}</small></div>
        <button class="primary-btn" data-action="travel-depart" ${locked || state.stats.money < cost ? "disabled" : ""}>整装启程</button>
        <button class="ghost-btn" data-action="back-main">暂不出发</button>
      </footer>
    </article>`;
}

function travelRunView() {
  const run = normalizeTravelRun(state.pendingTravel);
  if (!run) return travelView();
  const destination = travelDestinationById(run.destinationId);
  const progress = run.events.length ? Math.round((run.index / run.events.length) * 100) : 100;
  if (run.index >= run.events.length) {
    return `
      <article class="play-card travel-run-card travel-arrival">
        <div class="arrival-mark">${icon(destination.icon, destination.name)}</div>
        <p class="eyebrow">抵达 · ${escapeHtml(destination.name)}</p>
        <h2>${escapeHtml(destination.landmark)}在望</h2>
        <p>${escapeHtml(destination.story)}一路行程评定：${travelQualityLabel(run.quality)}（${Math.round(run.quality)}）。你还可以选择一项当地游历。</p>
        ${travelJourneyProgress(run, 100)}
        <div class="arrival-activity-grid">
          <button class="arrival-activity" data-travel-local="landmark">${icon(destination.icon, destination.landmark)}<span><b>游览名胜</b><small>细看${escapeHtml(destination.landmark)}，增长${escapeHtml(STAT_LABELS[destination.stat] || destination.stat)}与心情</small></span></button>
          <button class="arrival-activity" data-travel-local="souvenir" ${state.stats.money < 30 ? "disabled" : ""}>${icon("BookStore", destination.souvenir)}<span><b>采买风物 · ${moneyText(30)}</b><small>收藏${escapeHtml(destination.souvenir)}，带回一件旅途纪念</small></span></button>
          <button class="arrival-activity" data-travel-local="locals">${icon("FamilyFriendAvatar", "当地人")}<span><b>拜访当地人</b><small>听风土消息、结交人物，也许认识新友</small></span></button>
        </div>
        ${travelHistoryHtml(run.history)}
      </article>`;
  }
  const event = travelEventById(run.events[run.index]);
  return `
    <article class="play-card travel-run-card">
      <p class="eyebrow">在途 · ${escapeHtml(run.origin)}至${escapeHtml(destination.name)}</p>
      <h2>${escapeHtml(event.title)}</h2>
      <p>${escapeHtml(event.prompt)}</p>
      ${travelJourneyProgress(run, progress)}
      <div class="travel-run-stats"><span>旅伴 <b>${escapeHtml(run.companionName)}</b></span><span>旅途体验 <b>${Math.round(run.quality)}</b></span><span>车况 <b>${Math.round(state.travelSystem.condition)}</b></span></div>
      <div class="travel-choice-grid">${event.choices.map((choice, index) => `<button class="travel-choice" data-travel-choice="${index}"><b>${escapeHtml(choice[0])}</b><span>${escapeHtml(STAT_LABELS[choice[1]] || choice[1])}检定</span><small>${escapeHtml(choice[3])}</small></button>`).join("")}</div>
      ${travelHistoryHtml(run.history)}
    </article>`;
}

function travelJourneyProgress(run, progress) {
  const destination = travelDestinationById(run.destinationId);
  return `<section class="journey-progress"><div class="journey-line"><i style="width:${progress}%"></i><span class="journey-carriage" style="left:calc(${progress}% - 16px)">${icon("RepairCarriage", "车马")}</span></div><div><b>${escapeHtml(run.origin)}</b><span>${Math.round(progress)}%</span><b>${escapeHtml(destination.name)}</b></div></section>`;
}

function travelHistoryHtml(history = []) {
  return `<section class="travel-history"><h3>旅途札记</h3>${[...history].reverse().slice(0, 5).map((item) => `<article class="${item.ok === false ? "bad" : ""}"><b>${escapeHtml(item.title || "途中")}</b><span>${escapeHtml(item.text || "")}</span></article>`).join("")}</section>`;
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
        <button class="list-btn" data-page="codex">${icon("MainBook", "图鉴")}<span>成就图鉴<small>查看铜银金成就、人生阶段与本局评分。</small></span></button>
        <button class="list-btn" data-action="open-save-manager">${icon("MenuButton0", "存档")}<span>存档管理<small>多槽位保存、读取与导入导出。</small></span></button>
        <button class="list-btn" data-action="export">${icon("MenuButton1", "导出")}<span>导出存档<small>下载当前人生 JSON。</small></span></button>
        <button class="list-btn danger" data-action="new-life">${icon("MenuButton2", "重开")}<span>重新开始<small>清空当前存档并开新档。</small></span></button>
      </div>
      <div class="main-actions"><button class="ghost-btn" data-action="back-main">返回</button></div>
    </article>`;
}

function poetryView() {
  const round = normalizePoetryRound(state.poetryRound);
  if (!round) {
    return `
      <article class="play-card poetry-card">
        <p class="eyebrow">诗会</p>
        <h2>文斗</h2>
        <p>席上暂无新题，可回书院或宴会再开一局。</p>
        <div class="main-actions"><button class="ghost-btn" data-action="back-places">返回</button></div>
      </article>`;
  }
  const record = normalizePoetry(state.poetry);
  return `
    <article class="play-card poetry-card">
      <p class="eyebrow">诗会文斗</p>
      <h2>对上下联</h2>
      <p>束脩 ${moneyText(round.cost)}。学识越高，歪诗也有几分被抬举的可能。战绩 ${record.wins} 胜 ${record.losses} 负。</p>
      <div class="poetry-upper">
        <span>上联</span>
        <strong>${escapeHtml(round.upper)}</strong>
      </div>
      <div class="button-list poetry-options">
        ${round.options.map((option, index) => `
          <button class="list-btn" data-poetry-option="${index}">
            ${icon("MainBook", option.text)}
            <span>${escapeHtml(option.text)}<small>点选此下联应和</small></span>
          </button>`).join("")}
      </div>
      <div class="main-actions"><button class="ghost-btn" data-action="cancel-poetry">弃局返回</button></div>
    </article>`;
}

function matchmakerView() {
  const pool = refreshMatchPool(false);
  const livingSpouse = !!state.family.spouse && state.family.spouseMeta?.alive !== false;
  const hasLover = !!state.family.lover && !livingSpouse;
  return `
    <article class="play-card matchmaker-card">
      <p class="eyebrow">联姻策略局</p>
      <h2>细看人家</h2>
      <p>媒人摊开庚帖：家世、彩礼、性情、生育预期与娘家势力一应写明。选定需付媒资 ${moneyText(30)}，之后可在亲友页成婚；彩礼不足则婚仪难成。</p>
      ${hasLover ? `<p class="empty-note">当前相看：${escapeHtml(state.family.lover)}（${escapeHtml(matchSummary(state.family.loverProfile))}）。再选会更换对象。</p>` : ""}
      <div class="match-grid">
        ${pool.map((item) => `
          <article class="match-card">
            <strong>${escapeHtml(item.name)} · ${item.age}岁</strong>
            <small>${escapeHtml(item.familyName)} · 势力 ${item.power} · 性情${escapeHtml(item.personality)}</small>
            <p>${escapeHtml(item.note)}</p>
            <ul class="match-stats">
              <li>彩礼约 <b>${moneyText(item.bridePrice)}</b></li>
              <li>生育预期 <b>${item.fertility}</b></li>
              <li>容止 ${item.looks} · 识书 ${item.knowledge}</li>
            </ul>
            <button class="primary-btn" data-match-candidate="${escapeHtml(item.id)}" ${livingSpouse || state.stats.money < 30 ? "disabled" : ""}>选定相看</button>
          </article>`).join("")}
      </div>
      <div class="main-actions">
        <button class="secondary-btn" data-action="refresh-match">换几户人家</button>
        <button class="ghost-btn" data-action="back-places">返回</button>
      </div>
    </article>`;
}


function codexView() {
  const score = lifeScore();
  const doneIds = new Set(completedGoals().map((goal) => goal.id));
  const triggered = new Set(state.life?.milestones || []);
  const tierGroups = achievementsByTier();
  return `
    <article class="play-card codex-card">
      <p class="eyebrow">成就图鉴</p>
      <h2>${lifeGrade(score)} · ${score}</h2>
      <p>${escapeHtml(lifeInsight())}</p>
      <section class="score-grid">
        ${scoreTile("阶段", `${lifePhase().name} · ${lifePhase().focus}`)}
        ${scoreTile("成就", `${doneIds.size}/${LIFE_GOALS.length}`)}
        ${scoreTile("命册", `${state.log.length} 件事`)}
        ${scoreTile("亲友", `${relationCount()} 人`)}
      </section>
      <section class="codex-section">
        <div class="section-title"><h2>成就总览</h2><strong>${doneIds.size}/${LIFE_GOALS.length}</strong></div>
        <div class="achievement-tier-summary">
          ${tierGroups.map((group) => `
            <span class="${group.tier}">
              <b>${escapeHtml(group.meta.label)}章</b>
              ${group.done.length}/${group.goals.length}
            </span>`).join("")}
        </div>
        ${tierGroups.map((group) => `
          <section class="achievement-tier-block ${group.tier}">
            <div class="section-title">
              <h2>${escapeHtml(group.meta.name)}</h2>
              <strong>${escapeHtml(group.meta.scoreLabel)} · ${group.done.length}/${group.goals.length}</strong>
            </div>
            <div class="codex-grid">
              ${group.goals.map((goal) => {
                const done = doneIds.has(goal.id);
                return `
                  <article class="codex-item achievement-item ${group.tier} ${done ? "done" : "locked"}">
                    <span class="achievement-rank">${escapeHtml(group.meta.label)}</span>
                    ${icon(goal.icon, goal.title)}
                    <strong>${escapeHtml(done ? goal.title : "未解锁")}</strong>
                    <small>${escapeHtml(done ? goal.desc : goal.advice)}</small>
                  </article>`;
              }).join("")}
            </div>
          </section>`).join("")}
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
  const season = ensureLeisureSeason();
  const titles = seasonTitleNames(season.titles);
  return `
    <div class="gamble-mode-tabs">
      <button class="${active === "call" ? "active" : ""}" data-gamble-mode="call">叫骰</button>
      <button class="${active === "paiGow" ? "active" : ""}" data-gamble-mode="paiGow">牌九</button>
      <button class="${active === "bigSmall" ? "active" : ""}" data-gamble-mode="bigSmall">赌大小</button>
    </div>
    <div class="gamble-season-note">
      <span>本季战绩 · ${season.gambleWins} 胜 · 连胜 ${season.gambleStreak}</span>
      <small>${titles.length ? `已得名号：${escapeHtml(titles.join("、"))}` : "连胜可得博坊名号；连输四局会被暂列黑名单。"}</small>
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
  if (isGambleBlacklisted()) {
    const season = ensureLeisureSeason();
    return `
      <article class="play-card gamble-card gamble-closed-card">
        <p class="eyebrow">博坊 · 黑名单</p>
        <h2>今夜不接你的局</h2>
        <p>你近来连番失手，掌柜已经放话：到 ${season.blacklistedUntil} 岁这一年结束前，博坊都不再接你的注。</p>
        ${game.result?.text ? `<p class="empty-note">末局：${escapeHtml(game.result.text)}</p>` : ""}
        <div class="main-actions"><button class="ghost-btn" data-action="back-places">离开博坊</button></div>
      </article>`;
  }
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
  const officialRoute = state.official?.unlocked ? officialTendencyMeta().label : "";
  const tags = [
    lifeGrade(score),
    state.difficulty,
    state.location,
    state.age >= 80 ? "高寿" : "",
    state.age <= 35 ? "英年" : "",
    state.career ? careerKindLabel(careerKind(state.career)) : "",
    currentCareerName(),
    state.exam?.rank >= 0 ? EXAM_TITLES[state.exam.rank] : "",
    hasPalaceAppointment() ? "殿试及第" : "",
    officialRoute,
    state.official?.retired ? "致仕归乡" : "",
    Number(state.official?.records?.impeachments || 0) ? "遭遇弹劾" : "",
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
  if (state.official?.unlocked) {
    const rank = officialRankIndex();
    const clean = Number(state.official.clean || 0);
    const corrupt = Number(state.official.corruption || 0);
    if (corrupt >= 45 && corrupt > clean + 12) return "其为官多机巧而少仁恕，财货虽丰，身后却有言官追论，乡里谈及也多摇头。";
    if (rank >= 15 && clean >= 32) return "公为官数十载，所到之处弊绝风清；身后可望追赠清衔，入祀乡贤，子孙亦蒙余荫。";
    if (rank >= 11 && clean >= 20) return "公历州县省部，治事尚清，虽未尽免风波，百姓仍记其开仓、断狱与修堤诸事。";
    if (state.official.retired) return "公晚年乞骸归里，修谱课孙，把半生案牍风波都收进家乘之中。";
  }
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
  ctx.fillText(`命册经历 ${data.logCount} 件 · 成就 ${data.goalCount}/${data.goalTotal}`, 612, 1293);
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

function secretsView() {
  state.secretLines = normalizeSecretLinesState(state.secretLines, state.age);
  const summary = secretLineSummary();
  const totalHeat = Math.round(Number(state.underworld?.heat || 0) + Number(state.jianghu?.heat || 0));
  const examinerReady = state.career && careerKind(state.career) === "official" && officialRankIndex() >= 4;
  const examReady = state.age >= MAIN_EXAM_MIN_AGE && !state.dead && state.prisonYears <= 0 && !examTakenThisYear() && !state.exam.current && state.exam.rank < EXAM_STAGES.length - 1;
  const mysteryReady = state.age >= 16 && !state.dead && state.prisonYears <= 0;
  const jianghuReady = state.age >= 15 && !state.dead && state.prisonYears <= 0;
  const completedCases = new Map((state.mystery?.completed || []).map((item) => [item.caseId, item]));
  return `
    <article class="play-card secret-hub-card">
      <header class="secret-hub-hero">
        <div class="secret-seal">${icon("PrisonHeader", "奇闻暗线")}</div>
        <div><p class="eyebrow">奇闻暗线 · 明路之外</p><h2>一封黑帖，三条隐秘人生</h2><p>这些玩法不再藏在书院和职业深处。你可以从这里直接进入；做出的选择会通过风声、追查、官声与三年预言回到日常流年。</p></div>
        <aside><span>全城风声</span><strong>${totalHeat}</strong><small>${totalHeat < 20 ? "无人留意" : totalHeat < 50 ? "已有耳目" : "追查逼近"}</small></aside>
      </header>
      <section class="secret-line-grid">
        <article class="secret-line-card exam-line">
          <div class="secret-line-icon">${icon("Book", "科举舞弊")}</div>
          <span class="secret-line-tag">科举 · 黑灰产业链</span>
          <h3>贡院暗门</h3>
          <p>与作弊中介交涉，从夹带到买题布置五种手段；考官身份还会反向收到卖题邀约。</p>
          <div class="secret-line-state"><b>${escapeHtml(summary.exam)}</b><small>风声 ${Math.round(state.underworld?.heat || 0)} · 得手 ${state.underworld?.records?.successes || 0} · 败露 ${state.underworld?.records?.exposed || 0}</small></div>
          <button class="primary-btn" data-action="${examinerReady ? "start-secret-bribe" : "open-secret-exam"}" ${examinerReady || examReady ? "" : "disabled"}>${examinerReady ? "查看今科买题密函" : state.age < 15 ? "15 岁解锁" : state.exam.rank >= EXAM_STAGES.length - 1 ? "科名已尽，任考官后开启卖题" : examTakenThisYear() ? "今年已试" : "去见作弊中介"}</button>
        </article>
        <article class="secret-line-card mystery-line">
          <div class="secret-line-icon">${icon("PrisonHeader", "离奇案件")}</div>
          <span class="secret-line-tag">探案 · 多轮推理</span>
          <h3>六宗奇案</h3>
          <p>验尸、问证、搜查、翻卷，至少掌握三条线索后亲自指认。平民可协助查案，官员可获大量政绩。</p>
          <div class="secret-line-state"><b>${escapeHtml(summary.mystery)}</b><small>${state.career && careerKind(state.career) === "official" ? "官府主审：政绩与官声" : "民间协查：赏银与声望"}</small></div>
          <button class="primary-btn" data-action="start-secret-mystery" ${mysteryReady ? "" : "disabled"}>${state.age < 16 ? "16 岁解锁" : "领取一宗新案"}</button>
        </article>
        <article class="secret-line-card jianghu-line">
          <div class="secret-line-icon">${icon("GamblingHouse", "江湖奇术")}</div>
          <span class="secret-line-tag">江湖 · 奇术骗术</span>
          <h3>后巷茶棚</h3>
          <p>拜老千或相士为师，学习千术、相面、算命、假药和诈官；三年批命可能真的应验。</p>
          <div class="secret-line-state"><b>${escapeHtml(summary.jianghu)}</b><small>江湖风声 ${Math.round(state.jianghu?.heat || 0)} · 被擒 ${state.jianghu?.records?.caught || 0}</small></div>
          <button class="primary-btn" data-action="open-secret-jianghu" ${jianghuReady ? "" : "disabled"}>${state.age < 15 ? "15 岁解锁" : state.jianghu?.mentor ? "回到师门" : "去后巷拜师"}</button>
        </article>
      </section>
      <section class="case-archive-strip">
        <div class="section-title"><h2>奇案卷宗</h2><small>完成情况会永久留在本代命册</small></div>
        <div>${MYSTERY_CASES.map((item) => {
          const done = completedCases.get(item.id);
          return `<span class="${done ? (done.correct ? "solved" : "wrong") : ""}"><b>${escapeHtml(item.title)}</b><small>${done ? (done.correct ? "已破" : "错案") : "未启封"}</small></span>`;
        }).join("")}</div>
      </section>
      <footer class="secret-hub-foot"><span>提示：风声会随流年缓慢下降，但敲诈、追门与预言不会因为离开页面而消失。</span><button class="ghost-btn" data-action="back-main">收起黑帖</button></footer>
    </article>`;
}

function examUnderworldView() {
  state.underworld = normalizeUnderworld(state.underworld);
  const broker = state.underworld.broker || { name: "贡院鼠", trust: 40 };
  const active = EXAM_CHEAT_METHODS.find((item) => item.id === state.underworld.activeCheat?.id);
  return `
    <article class="play-card underworld-card">
      <header class="dark-system-hero"><div>${icon("PrisonHeader", "贡院暗门")}</div><span><p class="eyebrow">科举 · 黑灰门路</p><h2>${escapeHtml(broker.name)}的密室</h2><p>这里没有稳妥买卖。银钱、把柄与功名一起过手，风声越高，搜检与翻脸的概率越大。</p></span><b>风声 ${Math.round(state.underworld.heat)}</b></header>
      ${active ? `<p class="dark-warning">已布置：${escapeHtml(active.name)}。下一次正科交卷时自动生效，入场前无法撤回。</p>` : ""}
      <div class="dark-method-grid">${EXAM_CHEAT_METHODS.map((method) => {
        const gated = method.requireExaminer && !(state.stats.relationship >= 70 || state.friends.some((item) => /考官|学政|官员/.test(item.relation || "")));
        return `<article class="dark-method"><span><b>${escapeHtml(method.name)}</b><em>风险 ${method.risk}% · 风声 +${method.heat}</em></span><p>${escapeHtml(method.note)}</p><button class="text-btn inline-action" data-exam-cheat="${method.id}" ${active || gated || !canUseExamCheat(method) ? "disabled" : ""}>${gated ? "尚不认识考官" : `交 ${moneyText(method.cost)} 布局`}</button></article>`;
      }).join("")}</div>
      <section class="dark-record"><b>暗账</b><span>尝试 ${state.underworld.records.attempts} · 得手 ${state.underworld.records.successes} · 败露 ${state.underworld.records.exposed} · 卖题 ${state.underworld.records.soldQuestions}</span></section>
      <div class="main-actions"><button class="primary-btn" data-action="back-exam">回到明场</button><button class="ghost-btn" data-action="open-secrets">奇闻总览</button></div>
    </article>`;
}

function suspendMysteryCase() {
  if (!state?.mystery?.active) return;
  // 保留进度，仅退出全屏办案视图，避免卡死流年
  view.page = "main";
  view.overlay = "";
  state.lastDeltas = [{ label: "奇案", value: "暂且搁置", type: "text" }];
  addLog("案卷暂搁", "你把案卷先压在几下。流年可继续推进；想继续查时，可从奇闻暗线再打开。", []);
  save();
  render();
}

function mysteryCaseView() {
  const active = state.mystery.active;
  const item = activeMysteryCase();
  if (!active || !item) {
    if (state.mystery) state.mystery.active = null;
    return overviewView();
  }
  const actions = [["autopsy", "验尸", "从伤口、毒物与尸体现象判断死因", "MedicineBag"], ["witness", "问证人", "拆分口供，寻找时间与措辞矛盾", "Relationship1"], ["scene", "搜查现场", "勘门窗、器物、脚印与被移动的细节", "MainBook"], ["records", "查阅卷宗", "追旧案、债务、亲缘与不为人知的动机", "Book"]];
  return `
    <article class="play-card mystery-card">
      <header class="mystery-hero"><div>${icon("PrisonHeader", item.title)}</div><span><p class="eyebrow">离奇案件 · 第 ${Math.min(active.round + 1, 4)} 轮 · ${active.role === "civilian" ? "民间协查" : "官府主审"}</p><h2>${escapeHtml(item.title)}</h2><p>${escapeHtml(item.intro)}</p><small>${active.role === "civilian" ? "破案可得赏银与声望；错案会破财损名。" : "破案可得大量政绩；错案会损害官声。"}</small></span></header>
      <section class="case-board"><div class="case-thread"></div>${active.clues.map((clue, index) => `<article><b>线索 ${index + 1} · ${escapeHtml(clue.label)}</b><p>${escapeHtml(clue.text)}</p></article>`).join("") || `<p class="empty-note">案卷刚刚展开，尚无可靠线索。</p>`}</section>
      ${active.round < 4 ? `<div class="investigation-grid">${actions.map(([id, label, note, iconName]) => `<button class="investigation-action" data-mystery-investigate="${id}" ${active.actionsUsed.includes(id) ? "disabled" : ""}>${icon(iconName, label)}<span><b>${label}</b><small>${note}</small></span></button>`).join("")}</div>` : ""}
      ${active.clues.length >= 3 ? `<section class="suspect-section"><div class="section-title"><h2>指认真凶</h2><small>一经落笔便不能反悔</small></div><div class="suspect-grid">${item.suspects.map(([id, name, role]) => `<button data-mystery-accuse="${id}"><b>${escapeHtml(name)}</b><span>${escapeHtml(role)}</span></button>`).join("")}</div></section>` : `<p class="dark-warning">至少取得三条线索后，才能正式指认嫌犯。</p>`}
      <div class="main-actions">
        <button class="secondary-btn" data-action="suspend-mystery">先放下案卷</button>
        <button class="ghost-btn" data-action="open-secrets">奇闻总览</button>
      </div>
    </article>`;
}

function jianghuView() {
  state.jianghu = normalizeJianghuState(state.jianghu);
  return `
    <article class="play-card jianghu-card">
      <header class="dark-system-hero"><div>${icon("GamblingHouse", "江湖")}</div><span><p class="eyebrow">江湖 · 奇术与骗术</p><h2>${state.jianghu.mentor ? `${escapeHtml(state.jianghu.mentor.name)}门下` : "后巷茶棚"}</h2><p>术能窥人心，也能反噬自己。江湖风声与科场风声彼此相加，越出名越难全身而退。</p></span><b>风声 ${Math.round(state.jianghu.heat + state.underworld.heat)}</b></header>
      ${!state.jianghu.mentor ? `<section class="mentor-invite"><h3>有人在等一个敢入局的徒弟</h3><p>交茶钱、过眼力关，随机结识一位江湖师父。</p><button class="primary-btn" data-action="jianghu-mentor" ${state.stats.money < 80 ? "disabled" : ""}>递茶拜师 · ${moneyText(80)}</button></section>` : `<p class="dark-warning">师父 ${escapeHtml(state.jianghu.mentor.name)} · 信任 ${Math.round(state.jianghu.mentor.affection)}</p>`}
      <div class="dark-method-grid">${JIANGHU_SKILLS.map((skill) => {
        const learned = state.jianghu.skills.includes(skill.id);
        const lockedUse = skill.id === "impersonate" && !state.inventory.includes("官差衣冠");
        return `<article class="dark-method ${learned ? "learned" : ""}"><span><b>${escapeHtml(skill.name)}</b><em>${learned ? "已学会" : `学费 ${moneyText(skill.cost)}`}</em></span><p>${escapeHtml(skill.note)}</p>${learned ? `<button class="text-btn inline-action" data-jianghu-use="${skill.id}" ${lockedUse ? "disabled" : ""}>${skill.id === "qian" ? (state.jianghu.enabledQian ? "收起千术" : "博坊启用") : lockedUse ? "缺官差衣冠" : "施展此术"}</button>` : `<button class="text-btn inline-action" data-jianghu-learn="${skill.id}" ${!state.jianghu.mentor || state.stats.money < skill.cost ? "disabled" : ""}>向师父学</button>`}</article>`;
      }).join("")}</div>
      ${state.jianghu.skills.includes("impersonate") && !state.inventory.includes("官差衣冠") ? `<button class="secondary-btn" data-action="jianghu-costume" ${state.stats.money < 180 ? "disabled" : ""}>买旧官差衣冠 · ${moneyText(180)}</button>` : ""}
      ${state.jianghu.prophecy ? `<section class="prophecy-slip"><b>未应之卦 · ${state.jianghu.prophecy.dueYear - state.year} 年后</b><p>${escapeHtml(state.jianghu.prophecy.text)}</p></section>` : ""}
      <section class="dark-record"><b>江湖旧账</b><span>设局 ${state.jianghu.records.cons} · 被擒 ${state.jianghu.records.caught} · 批命 ${state.jianghu.records.prophecies} · 应真 ${state.jianghu.records.trueProphecies}</span></section>
      <div class="main-actions"><button class="primary-btn" data-action="open-secrets">奇闻总览</button><button class="ghost-btn" data-action="back-places">返回活动</button></div>
    </article>`;
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
          <button class="ghost-btn danger" data-action="open-exam-underworld" ${state.age < MAIN_EXAM_MIN_AGE || examTakenThisYear() ? "disabled" : ""}>贡院暗门</button>
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
  const topic = normalizePalaceTopic(current.topic || {});
  return `
    <article class="play-card exam-card">
      <p class="eyebrow">${escapeHtml(stage.name)}</p>
      <h2>${escapeHtml(topic.topic || "策问")}</h2>
      <p>${escapeHtml(topic.prompt || "主考官命你立意成文。")}选题旨与文风后交卷。</p>
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
  const official = event.kind === "officialCase";
  const familyStory = event.kind === "familyStory";
  const careerCase = event.kind === "careerCase";
  const fortuneEvent = event.kind === "fortuneEvent";
  const prisonEvent = event.kind === "prisonYear";
  const culturalEvent = event.kind === "culturalEvent";
  const worldEvent = event.kind === "worldArc";
  const darkEvent = ["examinerBribe", "underworldConsequence", "jianghuProphecy", "secretIntroduction"].includes(event.kind);
  const eyebrow = worldEvent ? `${state.dynasty.eraName}${state.dynasty.reignYear}年 · 天下主线` : prisonEvent ? `牢狱流年 · 余刑 ${state.prisonYears} 年` : culturalEvent ? `${CULTURAL_SEASONS[event.season]?.name || "四时"}时 · ${event.culturalType === "festival" ? "传统节日" : "二十四节气"}` : event.kind === "secretIntroduction" ? "奇闻暗线开启" : event.kind === "examinerBribe" ? "贡院暗局" : event.kind === "underworldConsequence" ? "旧账追门" : event.kind === "jianghuProphecy" ? "江湖命数" : official ? "官场考验" : familyStory ? "家事流年" : careerCase ? "本业专案" : fortuneEvent ? "签运应验" : "事件";
  return `
    <article class="play-card event-card ${prisonEvent ? "prison-event" : ""} ${culturalEvent ? `culture-event season-${event.season}` : ""} ${worldEvent ? "world-event" : ""}">
      <p class="eyebrow">${eyebrow}</p>
      <h2>${escapeHtml(event.title || "事件")}</h2>
      <p>${formatText(fillPlaceholders(event.content || event.history || "", false))}</p>
      <div class="choice-list">
        ${
          options.length
            ? options.map(({ child, index }) => `<button class="choice-btn ${official || careerCase ? "official-choice" : ""}" data-choice="${index}" ${child.disabled ? "disabled" : ""}>
              <span>${escapeHtml(child.title || "继续")}</span>
              ${(official || familyStory || careerCase || fortuneEvent || darkEvent || prisonEvent || culturalEvent || worldEvent) && child.note ? `<small>${escapeHtml(child.note)}</small>` : ""}
            </button>`).join("")
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
      <p>${escapeHtml(state.name)}享年${state.age}岁，${escapeHtml(state.deathReason || "命数已尽")}。命格总评：${escapeHtml(lifeGrade(score))}，${score} 分。若妻子尚在或有子孙，可由家人承继家业继续此存档。</p>
      <section class="score-grid">
        ${scoreTile("达成成就", `${completedGoals().length}/${LIFE_GOALS.length}`)}
        ${scoreTile("命册经历", `${state.log.length} 件`)}
        ${scoreTile("功名", state.exam.rank >= 0 ? EXAM_TITLES[state.exam.rank] : "白身")}
        ${scoreTile("家业", `${state.assets.length} 处`)}
        ${scoreTile("世代", `第${generation}代`)}
        ${scoreTile("可继钱财", moneyText(inheritedMoney))}
      </section>
      ${endingSharePanel(share)}
      <section class="inherit-section">
        <div class="section-title"><h2>选择妻子或子孙承继</h2></div>
        ${heirs.length ? `<div class="button-list">${heirs.map((child) => `
          <button class="list-btn inherit-btn" data-inherit-child="${escapeHtml(child.id)}">
            ${icon(child.gender === "female" ? "Relationship2" : "Relationship1", child.name)}
            <span>${escapeHtml(child.name)}承继家业<small>${escapeHtml(child.relation || (child.gender === "female" ? "女儿" : "儿子"))} · ${child.age}岁 · 学业 ${Math.round(child.study || 0)} · 德行 ${Math.round(child.virtue || 0)} · 继承 ${moneyText(child.heirKind === "spouse" ? Math.max(20, Math.round(Math.max(0, state.stats.money || 0) * 0.88)) : inheritedMoney)}与 ${state.assets.length} 处家产</small></span>
          </button>`).join("")}</div>` : `<p class="empty-note">没有活着的妻子或子孙可承继家业，只能另开新档。</p>`}
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
        <small>${completedGoals().length}/${LIFE_GOALS.length} 个成就 · ${state.log.length} 件经历</small>
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
      ${infoLine("姻缘", state.family.spouse ? `已婚：${state.family.spouse}${state.family.concubines?.length ? ` · 侧室 ${state.family.concubines.length} 人` : ""}` : state.family.lover ? `相看：${state.family.lover}` : "未定")}
      ${infoLine("子女", `${livingChildren().length} 人${eligibleHeirs().length ? ` · 可承继 ${eligibleHeirs().length}` : ""}`)}
      ${infoLine("促织", `${state.crickets.length} 只 · 胜 ${state.cricketRecord.wins || 0}`)}
      ${state.career && careerKind(state.career) === "official" ? infoLine("官评", `${officialTitle()} · 政绩 ${state.official.merit || 0}`) : ""}
      ${infoLine("亲友", `${relationCount()} 人`)}
      ${infoLine("经历", `${state.log.length} 件事`)}
      <div class="goal-mini">
        <strong>已成成就 ${done.length}/${LIFE_GOALS.length}</strong>
        ${done.slice(0, 4).map((goal) => `<span>${escapeHtml(goal.title)}</span>`).join("") || `<small>尚未达成成就</small>`}
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
      ${state.career ? infoLine("当前", currentCareerName()) : `<p class="empty-note">尚无固定营生</p>`}
      ${state.career ? infoLine("本业", `${careerKindLabel(kind)} · ${Math.max(1, Number(progress.level) || 1)}级 · ${Math.round(Number(progress.exp) || 0)}经验`) : ""}
      ${(state.careerHistory || []).length ? infoLine("履历", `历任 ${(state.careerHistory || []).slice(-3).map((item) => item.displayName || item.name).join("、")}`) : ""}
      ${officialCareer ? officialCareerSummary() : ""}
      ${kind === "caravan" ? caravanRouteSummary() : ""}
      ${state.career && !officialCareer ? careerPracticeSummary(progress) : ""}
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
    ...(state.family.spouse ? [[state.family.spouse, relationSummary({ ...state.family.spouseMeta, relation: state.gender === "male" ? "妻子" : "夫君", name: state.family.spouse, affection: state.family.spouseAffection || 78 })]] : []),
    ...(state.family.concubines || []).filter((item) => item.alive !== false).map((item) => [item.name, relationSummary(item)]),
    ...(state.family.lover ? [[state.family.lover, relationSummary({ relation: "相看之人", affection: 64, ...state.family.loverMeta, name: state.family.lover })]] : []),
    ...livingChildren().map((child) => [child.name, `${child.relation} · ${child.age}岁 · 体魄 ${Math.round(child.physique || 0)} · 学业 ${Math.round(child.study || 0)}`]),
    ...livingChildren().filter((child) => child.spouse && child.spouse.alive !== false).map((child) => [child.spouse.name, `${child.gender === "female" ? "女婿" : "儿媳"} · 与${child.name}成婚 · ${child.spouse.age}岁`]),
    ...livingGrandchildren().map((child) => [child.name, `${child.relation} · ${child.age}岁 · 父母 ${child.parentName} · 学业 ${Math.round(child.study || 0)}`]),
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
    if (state.pendingSurprise?.secretOffer) return declineSecretOffer();
    view.overlay = "";
    state.pendingSurprise = null;
    save();
    render();
    return;
  }
  if (button.dataset.action === "accept-secret") return acceptSecretOffer();
  if (button.dataset.action === "decline-secret") return declineSecretOffer();
  if (button.dataset.action === "open-poetry") return openPoetryContest();
  if (button.dataset.action === "cancel-poetry") return cancelPoetryContest();
  if (button.dataset.poetryOption !== undefined) return answerPoetry(button.dataset.poetryOption);
  if (button.dataset.matchCandidate) return selectMatchCandidate(button.dataset.matchCandidate);
  if (button.dataset.action === "refresh-match") {
    refreshMatchPool(true);
    save();
    render();
    return;
  }
  if (button.dataset.action === "close-achievement") {
    state.pendingAchievement = null;
    save();
    render();
    return;
  }
  if (button.dataset.action === "open-achievement-codex") {
    state.pendingAchievement = null;
    view.page = "codex";
    view.overlay = "";
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
        view.overlay = state.onboarding?.seen ? (state.pendingSurprise ? "surprise" : "") : "onboarding";
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
  if (button.dataset.action === "open-exam-underworld") return openExamUnderworld();
  if (button.dataset.action === "open-secrets") return openSecretHub();
  if (button.dataset.action === "open-secret-exam") return openExamUnderworld();
  if (button.dataset.action === "start-secret-bribe") return startExaminerBribe();
  if (button.dataset.action === "start-secret-mystery") return startMysteryCase();
  if (button.dataset.action === "suspend-mystery") return suspendMysteryCase();
  if (button.dataset.action === "resume-mystery") return resumeMysteryCase();
  if (button.dataset.action === "open-secret-jianghu") return useSpecialPlace("jianghu");
  if (button.dataset.action === "back-exam") {
    view.page = "exam";
    render();
    return;
  }
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
    if (button.dataset.shortcut === "secrets") return openSecretHub();
    view.page = button.dataset.shortcut;
    view.placeId = "";
    render();
    return;
  }
  if (button.dataset.door) {
    if (button.dataset.door === "secrets") return openSecretHub();
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
  if (button.dataset.examCheat) return prepareExamCheat(button.dataset.examCheat);
  if (button.dataset.mysteryInvestigate) return investigateMystery(button.dataset.mysteryInvestigate);
  if (button.dataset.mysteryAccuse) return accuseMystery(button.dataset.mysteryAccuse);
  if (button.dataset.jianghuLearn) return learnJianghuSkill(button.dataset.jianghuLearn);
  if (button.dataset.jianghuUse) return useJianghuSkill(button.dataset.jianghuUse);
  if (button.dataset.action === "jianghu-mentor") return meetJianghuMentor();
  if (button.dataset.action === "jianghu-costume") return buyJianghuCostume();
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
  if (button.dataset.brothelAction) return chooseBrothelCompanion(button.dataset.brothelId, button.dataset.brothelAction);
  if (button.dataset.redeemCourtesan) return redeemCourtesan(button.dataset.redeemCourtesan);
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
  if (button.dataset.action === "brothel-refresh") return startCourtesanParlor(true);
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
  if (button.dataset.marryChild) return marryChild(button.dataset.marryChild);
  if (button.dataset.inheritChild) return inheritFromChild(button.dataset.inheritChild);
  if (button.dataset.relationAction) return interactRelation(button.dataset.relationTarget, button.dataset.relationAction);
  if (button.dataset.action === "send-letter") return sendLetter();
  if (button.dataset.action === "marry-lover") return marryLover();
  if (button.dataset.action === "take-concubine") return takeConcubine();
  if (button.dataset.action === "official-work") return handleOfficialWork();
  if (button.dataset.assetAction) return manageAsset(button.dataset.assetIndex, button.dataset.assetAction);
  if (button.dataset.buyAsset !== undefined) return buyAsset(button.dataset.buyAsset);
  if (button.dataset.travelCompanion) return selectTravelCompanion(button.dataset.travelCompanion);
  if (button.dataset.travelSupply) return selectTravelSupply(button.dataset.travelSupply);
  if (button.dataset.travelChoice !== undefined) return resolveTravelChoice(button.dataset.travelChoice);
  if (button.dataset.travelLocal) return completeTravelActivity(button.dataset.travelLocal);
  if (button.dataset.travelUpgrade) return upgradeTravelCarriage(button.dataset.travelUpgrade);
  if (button.dataset.action === "travel-depart") return startTravelJourney();
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
        else {
          state = importedState;
          currentSlot = targetSlot;
          view.screen = "game";
          view.page = "main";
          view.overlay = state.onboarding?.seen ? (state.pendingSurprise ? "surprise" : "") : "onboarding";
          render();
        }
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
