/**
 * 起名汉字字库（算法团队维护）
 *
 * 每个汉字包含以下元数据，供起名打分算法使用：
 *  - char    汉字
 *  - pinyin  带声调拼音
 *  - meaning 字义解释（用于向用户说明寓意）
 *  - element 五行属性：metal/wood/water/fire/earth
 *  - gender  适用性别倾向：male / female / neutral
 *  - tags    寓意标签，用于按用户期望进行匹配
 *  - source  灵感出处（诗词典籍等），用于增强名字的文化底蕴
 *
 * 标签体系（tags）：
 *  wisdom 智慧 · virtue 品德 · health 健康平安 · beauty 容貌气质
 *  elegant 文雅 · ambition 志向抱负 · nature 自然意象
 *  strong 坚强独立 · fortune 福气吉祥 · gentle 温柔 · bright 阳光开朗
 */

const ELEMENT_LABELS = {
  metal: "金",
  wood: "木",
  water: "水",
  fire: "火",
  earth: "土",
};

const TAG_LABELS = {
  wisdom: "智慧",
  virtue: "品德",
  health: "健康平安",
  beauty: "容貌气质",
  elegant: "文雅",
  ambition: "志向抱负",
  nature: "自然意象",
  strong: "坚强独立",
  fortune: "福气吉祥",
  gentle: "温柔",
  bright: "阳光开朗",
};

// 五行相生关系：木生火、火生土、土生金、金生水、水生木
const ELEMENT_GENERATES = {
  wood: "fire",
  fire: "earth",
  earth: "metal",
  metal: "water",
  water: "wood",
};

const CHAR_LIBRARY = [
  // —— 偏中性 / 通用 ——
  { char: "睿", pinyin: "ruì", meaning: "聪慧通达，思虑深远", element: "metal", gender: "neutral", tags: ["wisdom", "ambition"], source: "《尚书》：思曰睿，睿作圣" },
  { char: "彦", pinyin: "yàn", meaning: "有才学德行的贤士", element: "wood", gender: "neutral", tags: ["wisdom", "virtue"], source: "《尔雅》：美士为彦" },
  { char: "嘉", pinyin: "jiā", meaning: "美好善良，吉庆祥和", element: "wood", gender: "neutral", tags: ["virtue", "fortune"], source: "《诗经》：嘉乐君子，显显令德" },
  { char: "知", pinyin: "zhī", meaning: "通晓事理，聪明睿智", element: "fire", gender: "neutral", tags: ["wisdom"], source: "《论语》：知之为知之" },
  { char: "禾", pinyin: "hé", meaning: "禾苗茁壮，丰收安稳", element: "water", gender: "neutral", tags: ["nature", "fortune"], source: "《诗经》：十月纳禾稼" },
  { char: "辰", pinyin: "chén", meaning: "日月星辰，光明远大", element: "earth", gender: "neutral", tags: ["ambition", "bright"], source: "《诗经》：振振君子，归哉归哉" },
  { char: "安", pinyin: "ān", meaning: "平安顺遂，安稳康宁", element: "earth", gender: "neutral", tags: ["health", "fortune"], source: "《道德经》：安平太" },
  { char: "和", pinyin: "hé", meaning: "和顺谦和，温厚宽容", element: "water", gender: "neutral", tags: ["virtue", "gentle"], source: "《论语》：礼之用，和为贵" },
  { char: "之", pinyin: "zhī", meaning: "古雅虚字，含蓄隽永", element: "fire", gender: "neutral", tags: ["elegant"], source: "王羲之、顾恺之等名士用字" },
  { char: "宁", pinyin: "níng", meaning: "宁静安泰，岁岁安宁", element: "fire", gender: "neutral", tags: ["health", "gentle"], source: "《诗经》：归宁父母" },
  { char: "可", pinyin: "kě", meaning: "称心如意，温和可亲", element: "wood", gender: "neutral", tags: ["gentle", "fortune"], source: "《诗经》：佻佻公子，行彼周行" },
  { char: "予", pinyin: "yǔ", meaning: "给予奉献，胸怀宽厚", element: "earth", gender: "neutral", tags: ["virtue"], source: "《诗经》：彼姝者子，何以畀之" },

  // —— 偏男孩 ——
  { char: "浩", pinyin: "hào", meaning: "浩大磅礴，胸襟开阔", element: "water", gender: "male", tags: ["strong", "ambition"], source: "《楚辞》：浩浩沅湘" },
  { char: "宇", pinyin: "yǔ", meaning: "天地空间，气宇轩昂", element: "earth", gender: "male", tags: ["ambition", "bright"], source: "《滕王阁序》：宇文新州之懿范" },
  { char: "轩", pinyin: "xuān", meaning: "高昂气派，仪表堂堂", element: "earth", gender: "male", tags: ["bright", "ambition"], source: "《史记》：轩昂大度" },
  { char: "晨", pinyin: "chén", meaning: "清晨朝阳，朝气蓬勃", element: "fire", gender: "neutral", tags: ["bright", "health"], source: "《诗经》：女曰鸡鸣，士曰昧旦" },
  { char: "煜", pinyin: "yù", meaning: "照耀光明，前程似锦", element: "fire", gender: "male", tags: ["bright", "ambition"], source: "《太玄经》：日以煜乎昼" },
  { char: "霖", pinyin: "lín", meaning: "甘霖普降，恩泽绵长", element: "water", gender: "male", tags: ["fortune", "nature"], source: "《尚书》：用汝作霖雨" },
  { char: "峰", pinyin: "fēng", meaning: "高峰挺拔，志向高远", element: "water", gender: "male", tags: ["strong", "ambition"], source: "《望岳》：会当凌绝顶" },
  { char: "骏", pinyin: "jùn", meaning: "良马奔腾，才能出众", element: "metal", gender: "male", tags: ["strong", "ambition"], source: "《诗经》：駉駉牡马，在坰之野" },
  { char: "钧", pinyin: "jūn", meaning: "尊贵重器，雷霆万钧", element: "metal", gender: "male", tags: ["strong", "fortune"], source: "《楚辞》：奏九歌而舞韶兮" },
  { char: "策", pinyin: "cè", meaning: "运筹谋略，足智多谋", element: "wood", gender: "male", tags: ["wisdom", "ambition"], source: "《出师表》：咨臣以当世之事" },
  { char: "屹", pinyin: "yì", meaning: "屹立不倒，坚定沉稳", element: "earth", gender: "male", tags: ["strong", "virtue"], source: "屹然不动，砥柱中流" },
  { char: "渊", pinyin: "yuān", meaning: "渊博深沉，学识广博", element: "water", gender: "male", tags: ["wisdom", "elegant"], source: "《庄子》：鲲之大，不知其几千里" },
  { char: "翊", pinyin: "yì", meaning: "辅佐振翅，扶摇直上", element: "wood", gender: "male", tags: ["ambition", "strong"], source: "《汉书》：翊卫王室" },
  { char: "墨", pinyin: "mò", meaning: "笔墨书香，文采斐然", element: "water", gender: "male", tags: ["elegant", "wisdom"], source: "《文心雕龙》：言立而文明" },
  { char: "昭", pinyin: "zhāo", meaning: "光明显著，明白通达", element: "fire", gender: "male", tags: ["bright", "wisdom"], source: "《诗经》：明明在下，赫赫在上" },
  { char: "弈", pinyin: "yì", meaning: "棋艺纵横，深谋远虑", element: "wood", gender: "male", tags: ["wisdom"], source: "《孟子》：今夫弈之为数" },
  { char: "铭", pinyin: "míng", meaning: "铭记于心，坚毅笃志", element: "metal", gender: "male", tags: ["virtue", "ambition"], source: "《礼记》：铭者，自名也" },
  { char: "森", pinyin: "sēn", meaning: "林木繁茂，生机勃发", element: "wood", gender: "male", tags: ["nature", "strong"], source: "万木森森，蔚然成林" },

  // —— 偏女孩 ——
  { char: "梓", pinyin: "zǐ", meaning: "梓树成材，自强自立", element: "wood", gender: "female", tags: ["nature", "strong"], source: "《诗经》：维桑与梓，必恭敬止" },
  { char: "涵", pinyin: "hán", meaning: "涵养包容，气度从容", element: "water", gender: "female", tags: ["virtue", "gentle"], source: "海纳百川，有容乃大" },
  { char: "依", pinyin: "yī", meaning: "依依柔美，亲和可人", element: "earth", gender: "female", tags: ["gentle", "beauty"], source: "《诗经》：昔我往矣，杨柳依依" },
  { char: "宛", pinyin: "wǎn", meaning: "婉约柔美，温婉可人", element: "earth", gender: "female", tags: ["beauty", "gentle"], source: "《诗经》：有美一人，清扬婉兮" },
  { char: "璇", pinyin: "xuán", meaning: "美玉璇玑，珍贵高洁", element: "fire", gender: "female", tags: ["beauty", "elegant"], source: "《楚辞》：抚朱弦兮璇玑" },
  { char: "汐", pinyin: "xī", meaning: "夜潮汐水，温润灵动", element: "water", gender: "female", tags: ["nature", "gentle"], source: "潮起潮汐，灵动自然" },
  { char: "悦", pinyin: "yuè", meaning: "喜悦欢欣，乐观开朗", element: "metal", gender: "female", tags: ["bright", "gentle"], source: "《论语》：不亦说乎" },
  { char: "婧", pinyin: "jìng", meaning: "苗条美好，才貌兼备", element: "wood", gender: "female", tags: ["beauty", "wisdom"], source: "《说文》：婧，竦立也" },
  { char: "妍", pinyin: "yán", meaning: "巧丽美好，秀外慧中", element: "water", gender: "female", tags: ["beauty"], source: "《长门赋》：奉虚言而望诚兮" },
  { char: "兮", pinyin: "xī", meaning: "古韵语助，灵秀飘逸", element: "metal", gender: "female", tags: ["elegant"], source: "《楚辞》：袅袅兮秋风" },
  { char: "棠", pinyin: "táng", meaning: "海棠芬芳，娇艳明丽", element: "wood", gender: "female", tags: ["nature", "beauty"], source: "《诗经》：蔽芾甘棠，勿翦勿伐" },
  { char: "玥", pinyin: "yuè", meaning: "传说神珠，珍稀祥瑞", element: "metal", gender: "female", tags: ["fortune", "beauty"], source: "古传神珠，谓之玥也" },
  { char: "蕴", pinyin: "yùn", meaning: "蕴藉含蓄，内秀深厚", element: "wood", gender: "female", tags: ["elegant", "wisdom"], source: "《周易》：君子以言有物" },
  { char: "笑", pinyin: "xiào", meaning: "笑靥盈盈，乐观豁达", element: "metal", gender: "female", tags: ["bright", "gentle"], source: "《诗经》：巧笑倩兮，美目盼兮" },
  { char: "瑶", pinyin: "yáo", meaning: "美玉琼瑶，纯洁珍贵", element: "fire", gender: "female", tags: ["beauty", "fortune"], source: "《诗经》：投我以木桃，报之以琼瑶" },
  { char: "雅", pinyin: "yǎ", meaning: "高雅文静，端庄大方", element: "wood", gender: "female", tags: ["elegant", "virtue"], source: "《论语》：子所雅言，诗书执礼" },
];


if (typeof module !== "undefined" && module.exports) {
  module.exports = { CHAR_LIBRARY, ELEMENT_LABELS, TAG_LABELS, ELEMENT_GENERATES };
}
