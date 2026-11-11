/* =========================================================
   词汇数据文件
   ---------------------------------------------------------
   想加新批次：复制下面一个 { ... } 对象，改 id / 标题 / 段落 / 词表。
   正文里用 [[word]] 或 [[词形|原形]] 标记生词，例如：
       [[detached|detach]]  -> 页面显示 detached，点击跳到 detach
   中文译文里用 **加粗** 标出对应词，便于对照。
   ========================================================= */
window.VOCAB = {
  meta: {
    title: "英语阅读本",
    subtitle: "English Reader",
    updated: "2026-11-11"
  },

  /* 领域划分：每篇短文归到一个领域，页面上可以按领域筛选 */
  fields: [
    { id: "science",    name: "科学", en: "Science",   desc: "研究、实验、发现" },
    { id: "society",    name: "社会", en: "Society",   desc: "群体、公平、人口" },
    { id: "economy",    name: "经济", en: "Economy",   desc: "增长、市场、就业" },
    { id: "policy",     name: "政策", en: "Policy",    desc: "法规、治理、公共服务" },
    { id: "climate",    name: "气候", en: "Climate",   desc: "环境、能源、极端天气" },
    { id: "phenomenon", name: "现象", en: "Phenomena", desc: "趋势、观念、日常现象" }
  ],

  /* 各领域的高频说法：写作、翻译可以直接拿来用 */
  lexicon: {
    science: [
      { en: "conduct a study", zh: "开展研究", note: "比 do research 正式，论文和新闻都常用" },
      { en: "empirical evidence", zh: "实证证据", note: "强调来自观察和实验，不是理论推演" },
      { en: "a peer-reviewed journal", zh: "同行评审期刊", note: "说明研究可靠性的固定说法" },
      { en: "replicate the findings", zh: "重复验证结果", note: "科学写作里谈“可重复性”的标准搭配" },
      { en: "a control group", zh: "对照组", note: "实验类文章必备，对应 experimental group" },
      { en: "a statistically significant difference", zh: "统计上显著的差异", note: "谨慎表述，避免直接说 prove" },
      { en: "draw a conclusion", zh: "得出结论", note: "draw 比 make 更书面" },
      { en: "raise questions about", zh: "对……提出疑问", note: "阅读里引出争议的常用动词" },
      { en: "the underlying mechanism", zh: "背后的机制", note: "underlying 是高频形容词，指“潜藏的、根本的”" },
      { en: "a body of research", zh: "一批研究成果", note: "a body of 还可接 evidence / work / knowledge" },
      { en: "findings suggest that…", zh: "研究结果表明……", note: "比 prove 稳妥，学术写作偏好这种表述" },
      { en: "a correlation between A and B", zh: "A 与 B 的相关性", note: "注意：correlation 不等于 causation" }
    ],
    society: [
      { en: "social cohesion", zh: "社会凝聚力", note: "cohesion 指“黏合”，常与 weaken / strengthen 搭配" },
      { en: "widening inequality", zh: "不断扩大的不平等", note: "widening / growing 是修饰 gap、inequality 的固定搭配" },
      { en: "a sense of belonging", zh: "归属感", note: "a sense of + 抽象名词，高频结构" },
      { en: "marginalised groups", zh: "边缘群体", note: "也作 vulnerable groups / disadvantaged groups" },
      { en: "social mobility", zh: "社会流动性", note: "常说 upward mobility（向上流动）" },
      { en: "public attitudes towards", zh: "公众对……的态度", note: "attitude 后接 towards 或 to" },
      { en: "put pressure on public services", zh: "给公共服务带来压力", note: "put pressure on 是万能搭配" },
      { en: "community ties", zh: "社区纽带", note: "tie 表“联系”时常用复数" },
      { en: "an ageing population", zh: "老龄化人口", note: "英式 ageing，美式 aging" },
      { en: "social exclusion", zh: "社会排斥", note: "与 social inclusion 相对" },
      { en: "a widening gap between rich and poor", zh: "贫富差距扩大", note: "gap 常与 widen / narrow 搭配" }
    ],
    economy: [
      { en: "economic growth", zh: "经济增长", note: "动词搭配 sustain / slow / boost growth" },
      { en: "a slowdown in demand", zh: "需求放缓", note: "slowdown in + 领域，比 decrease 更常用于经济语境" },
      { en: "the rising cost of living", zh: "生活成本上升", note: "cost of living 是固定短语" },
      { en: "consumer confidence", zh: "消费者信心", note: "常说 confidence falls / recovers" },
      { en: "the labour market", zh: "劳动力市场", note: "英式 labour，美式 labor" },
      { en: "fiscal stimulus", zh: "财政刺激", note: "对应 monetary policy（货币政策）" },
      { en: "supply chain disruption", zh: "供应链中断", note: "disruption 比 problem 更正式" },
      { en: "profit margins", zh: "利润率", note: "margin 表“利润空间”时常用复数" },
      { en: "productivity gains", zh: "生产率提升", note: "gain 作名词表“增长、收益”" },
      { en: "a knock-on effect", zh: "连锁反应", note: "英式说法，美式常用 ripple effect" },
      { en: "household debt", zh: "家庭债务", note: "household 作定语，比 family 更经济学术" },
      { en: "an economic downturn", zh: "经济低迷", note: "对应 upturn（回升）" }
    ],
    policy: [
      { en: "introduce a policy", zh: "出台政策", note: "也可 adopt / implement / roll out a policy" },
      { en: "a regulatory framework", zh: "监管框架", note: "framework 是政策类文章的高频词" },
      { en: "enforce compliance", zh: "强制合规", note: "enforce 后面接规则，也可直接接 compliance" },
      { en: "a policy instrument", zh: "政策工具", note: "instrument 指实现目标的手段" },
      { en: "public consultation", zh: "公众咨询", note: "政策出台前的征求意见环节" },
      { en: "cut red tape", zh: "精简繁文缛节", note: "red tape 不可数，指官僚程序" },
      { en: "allocate funding", zh: "拨款", note: "allocate 常接 to：allocate funding to schools" },
      { en: "meet a target", zh: "达标", note: "对应 miss a target（未达标）" },
      { en: "a loophole in the law", zh: "法律漏洞", note: "loophole 常与 close / exploit 搭配" },
      { en: "roll out a scheme", zh: "推行一项计划", note: "roll out 强调“铺开”，比 start 更有规模感" },
      { en: "hold sb accountable", zh: "追究某人的责任", note: "accountable for sth / to sb" },
      { en: "unintended consequences", zh: "意外后果", note: "政策评估类文章的高频词组" }
    ],
    climate: [
      { en: "carbon emissions", zh: "碳排放", note: "常用复数，动词搭配 cut / curb / offset" },
      { en: "reach net zero", zh: "实现净零排放", note: "net zero 前不加冠词" },
      { en: "extreme weather events", zh: "极端天气事件", note: "event 在这里指一次具体事件" },
      { en: "rising sea levels", zh: "海平面上升", note: "level 用复数" },
      { en: "renewable energy", zh: "可再生能源", note: "对应 fossil fuels（化石燃料）" },
      { en: "adapt to a changing climate", zh: "适应气候变化", note: "adapt 是“适应”，mitigate 是“减缓”，别混" },
      { en: "a tipping point", zh: "临界点", note: "指越过之后不可逆的关口" },
      { en: "carbon footprint", zh: "碳足迹", note: "常说 reduce one's carbon footprint" },
      { en: "climate resilience", zh: "气候韧性", note: "resilience 是高频抽象名词" },
      { en: "phase out fossil fuels", zh: "逐步淘汰化石燃料", note: "phase out 强调分阶段退出" },
      { en: "global warming", zh: "全球变暖", note: "更正式的说法是 climate change" }
    ],
    phenomenon: [
      { en: "a growing trend", zh: "日益增长的趋势", note: "trend 常与 growing / emerging / downward 搭配" },
      { en: "a widespread belief", zh: "普遍的看法", note: "widespread 修饰 belief、concern、support" },
      { en: "a striking contrast", zh: "鲜明的对比", note: "striking 比 obvious 更有力度" },
      { en: "a shift in attitudes", zh: "态度的转变", note: "shift in + 抽象名词，比 change 更强调方向" },
      { en: "an emerging pattern", zh: "新出现的模式", note: "emerge 是阅读的高频动词" },
      { en: "a common misconception", zh: "常见的误解", note: "常用于“纠正看法”的段落开头" },
      { en: "a double-edged sword", zh: "双刃剑", note: "讨论利弊时的现成表达" },
      { en: "the root cause of", zh: "……的根源", note: "比 reason 更强调深层原因" },
      { en: "at the expense of", zh: "以……为代价", note: "常用来批评只看短期收益" },
      { en: "gain popularity", zh: "流行起来", note: "也可 gain traction（获得支持）" },
      { en: "a matter of concern", zh: "值得关注的事", note: "比 a problem 更克制" },
      { en: "a passing fad", zh: "一时的风尚", note: "fad 指来得快去得快的潮流" }
    ]
  },

  batches: [
    {
      id: "b01",
      title: "Transparency on Paper",
      titleZh: "纸面上的透明",
      genre: "议论文",
      field: "policy",
      date: "2026-11-09",
      note: "公共机构的信息公开 / 数字档案，考试仔细阅读常见题材。",

      paragraphs: [
        {
          en: "Public institutions are now expected to [[disclose]] far more than they once kept quiet, and no project has promised this more confidently than the digital archive. The claim is usually straightforward: once paper records are turned into searchable files, any citizen can [[retrieve]] what the state has done and hold it to account. The assumption deserves closer scrutiny. Digitisation may [[convert]] a fragile collection into a durable one, but it does not [[eliminate]] an older difficulty: someone still has to [[interpret]] what a document means. A photograph [[detached|detach]] from its file, or a ledger page [[retrieved|retrieve]] from a flooded basement, may be entirely accurate and still mislead, because a document's meaning depends on the records that surround it.",
          zh: "如今，公共机构被要求**披露**的内容远多于过去，而没有什么比“数字档案”在这方面的承诺更自信。这一设想通常很直白：纸质记录一旦被转成可检索的文件，任何公民都能**调取**国家做过的事并追究责任。但这种假设值得仔细推敲。数字化或许能把脆弱的馆藏**转换**成耐久的形式，却无法**消除**一个更古老的难题：总得有人去**解读**一份文件意味着什么。一张从卷宗里**拆下**的照片，一页从被淹地下室**找回**的账本，都可能完全真实，却仍然误导人，因为一份文件的意义取决于它周围的那些记录。"
        },
        {
          en: "Where such projects have worked, the achievement has been administrative rather than technological. Staff must [[designate]] which records deserve priority, [[enforce]] consistent rules about what may be published, and [[reinforce]] procedures that keep fragile material from being handled to death. This is costly work, and few archives can fund it alone; many rely on governments willing to [[subsidize]] storage, staffing and training. When that support disappears, the burden falls on unpaid volunteers — an arrangement that may [[alleviate]] immediate costs while leaving the collection exposed. Complicated access rules, meanwhile, tend to [[intimidate]] the ordinary reader rather than protect the record.",
          zh: "这类项目真正做成的部分，是管理层面的，而不是技术层面的。工作人员必须**指定**哪些记录优先，**执行**统一的公开规则，并**加固**那些防止脆弱材料被反复翻坏的程序。这些工作代价高昂，很少有档案馆能独自承担；许多机构依赖愿意**补贴**存储、人员和培训的政府。一旦这类支持消失，负担就落到无偿志愿者身上——这种安排或许能**缓解**眼前的成本，却让馆藏暴露在风险中。与此同时，复杂的查阅规则往往只是让普通读者**望而生畏**，而不是保护记录本身。"
        },
        {
          en: "Critics therefore [[speculate]] that transparency has become a form of performance. Institutions [[formulate]] targets they can comfortably meet, publish statistics that quietly [[contradict]] one another, and [[manipulate]] the wording of releases until disclosure flatters rather than exposes them. Readers who notice are [[frustrated|frustrate]]; readers who do not are simply reassured. Officials may [[indulge]] in the appearance of openness while resisting its substance, and departments may compete to [[surpass]] one another in the volume of data released rather than in its usefulness.",
          zh: "因此，批评者**推测**，透明已经变成一种表演。机构**制定**自己轻松就能达标的目标，公布彼此悄然**矛盾**的统计数字，并**操纵**新闻稿的措辞，直到披露变成粉饰而非揭露。看穿这一点的人因此**恼火**，看不出的人则安心如常。官员可能**沉溺**于开放的表象，却在实质上抵制开放；各部门之间也可能竞相在发布数据的数量上**超过**彼此，而不是在有用性上。"
        },
        {
          en: "None of this is new. The habit of publishing selectively did not [[originate]] with the internet, and the tension between a record and its audience has [[collided|collide]] with every attempt to make government legible. What is new is the scale. Rather than [[embark]] on ever larger releases, archives might do better to explain the smaller ones: who wrote a document, why it survived, and what it leaves out.",
          zh: "这些都不是新事。选择性公布的习惯并非**源自**互联网，记录与读者之间的紧张关系，也在每一次让政府“变得可读”的尝试中**撞上**了同样的障碍。新的是规模。与其**着手**发布越来越庞大的数据集，档案馆不如把较小的那些解释清楚：文件是谁写的，它为什么留存下来，又遗漏了什么。"
        }
      ],

      focus: [
        "enforce consistent rules",
        "reinforce procedures",
        "subsidize storage and staffing",
        "alleviate immediate costs",
        "formulate targets",
        "surpass a rival",
        "embark on sth",
        "collide with"
      ],

      words: [
        { lemma: "eliminate", pos: "v.", ipa: "/ɪˈlɪmɪneɪt/", meaning: "消除；淘汰", inText: "彻底消除（解释上的难题）", collocation: "eliminate a problem / a risk / a rival", diff: "和 alleviate 对照：eliminate 是彻底清零；alleviate 只是缓解痛苦或负担，不保证根除。" },
        { lemma: "retrieve", pos: "v.", ipa: "/rɪˈtriːv/", meaning: "取回；检索", inText: "调取（档案、数据）", collocation: "retrieve data / records / files；retrieve sth from…", diff: "和 detach 对照：retrieve 是“找回来”，detach 是“拆下来”。名词 retrieval。" },
        { lemma: "disclose", pos: "v.", ipa: "/dɪsˈkləʊz/", meaning: "披露；使公开", inText: "公开（机构信息）", collocation: "disclose information / figures / details", diff: "正式公文用词，比 reveal 更“机构化”。名词 disclosure。" },
        { lemma: "detach", pos: "v.", ipa: "/dɪˈtætʃ/", meaning: "拆下；使分离", inText: "从卷宗上拆下", collocation: "detach A from B", diff: "反义 attach。形容词 detached 还有“超然、客观的”义，阅读会考。" },
        { lemma: "alleviate", pos: "v.", ipa: "/əˈliːvieɪt/", meaning: "缓解；减轻（痛苦、负担）", inText: "缓解眼前的成本压力", collocation: "alleviate the burden / pressure / poverty", diff: "不表示根除，常与 eliminate 放在一起做对比。名词 alleviation。" },
        { lemma: "intimidate", pos: "v.", ipa: "/ɪnˈtɪmɪdeɪt/", meaning: "恐吓；使畏惧", inText: "让普通读者望而生畏", collocation: "intimidate sb into doing sth；be intimidated by", diff: "形容词 intimidating＝令人生畏的；intimidated＝自己害怕的。" },
        { lemma: "reinforce", pos: "v.", ipa: "/ˌriːɪnˈfɔːs/", meaning: "加固；强化", inText: "加固流程", collocation: "reinforce a procedure / a view / a wall", diff: "拆成 re-in-force 就好记。本批和 enforce 出现在同一句里对照。" },
        { lemma: "subsidize", pos: "v.", ipa: "/ˈsʌbsɪdaɪz/", meaning: "补贴；资助", inText: "补贴存储与人力", collocation: "subsidize housing / storage / training", diff: "名词 subsidy。主语通常是政府、机构，不是个人。" },
        { lemma: "frustrate", pos: "v.", ipa: "/frʌˈstreɪt/", meaning: "使受挫；使恼火", inText: "（读者）感到恼火", collocation: "be frustrated by / with；frustrate a plan", diff: "frustrated＝感到挫败的；frustrating＝令人恼火的，常考这一对。" },
        { lemma: "enforce", pos: "v.", ipa: "/ɪnˈfɔːs/", meaning: "执行；强制实施（法律、规则）", inText: "执行统一的公开规则", collocation: "enforce rules / a law / a ban", diff: "名词 enforcement。和 reinforce 只差一个前缀，意思完全不同。" },
        { lemma: "indulge", pos: "v.", ipa: "/ɪnˈdʌldʒ/", meaning: "沉溺；放纵；满足（喜好）", inText: "沉溺于开放的表象", collocation: "indulge in sth；indulge a taste for…", diff: "名词 indulgence。阅读里带轻微贬义，指“放任自己享受”。" },
        { lemma: "surpass", pos: "v.", ipa: "/səˈpɑːs/", meaning: "超过；胜过", inText: "在数量上超过彼此", collocation: "surpass expectations / a rival / a record", diff: "比 exceed 更有“跨过去”的画面感。surpass oneself＝超越自我。" },
        { lemma: "collide", pos: "v.", ipa: "/kəˈlaɪd/", meaning: "相撞；冲突", inText: "（与同样的障碍）相撞", collocation: "collide with sb/sth", diff: "名词 collision。抽象用法指意见、利益“相冲突”。" },
        { lemma: "originate", pos: "v.", ipa: "/əˈrɪdʒɪneɪt/", meaning: "起源；创始", inText: "并非源自互联网", collocation: "originate in / from；originate with sb", diff: "形容词 original，名词 origin。也可主动义：originate a plan＝首创一个方案。" },
        { lemma: "embark", pos: "v.", ipa: "/ɪmˈbɑːk/", meaning: "着手；开始；（使）上船", inText: "着手发布更大的数据集", collocation: "embark on / upon sth", diff: "本义是上船，引申为“开始一项大工程”，后面必须接 on/upon。" },
        { lemma: "convert", pos: "v.", ipa: "/kənˈvɜːt/", meaning: "转变；改造；使皈依", inText: "把脆弱馆藏转换成耐久形式", collocation: "convert A into B", diff: "名词 conversion。作名词时重音前移：/ˈkɒnvɜːt/（皈依者）。" },
        { lemma: "designate", pos: "v.", ipa: "/ˈdezɪɡneɪt/", meaning: "指定；划定；任命", inText: "指定哪些记录优先", collocation: "designate A as B；a designated area", diff: "形容词 designated＝指定的，如 designated driver（指定司机）。" },
        { lemma: "interpret", pos: "v.", ipa: "/ɪnˈtɜːprɪt/", meaning: "解释；解读；口译", inText: "解读一份文件", collocation: "interpret data / a rule；interpret for sb", diff: "名词 interpretation 兼“解释”与“口译”两义，靠语境判断。" },
        { lemma: "speculate", pos: "v.", ipa: "/ˈspekjuleɪt/", meaning: "推测；投机", inText: "推测透明已成表演", collocation: "speculate on / about sth", diff: "名词 speculation。金融义“投机”也是它，看语境取义。" },
        { lemma: "contradict", pos: "v.", ipa: "/ˌkɒntrəˈdɪkt/", meaning: "反驳；与…矛盾", inText: "彼此矛盾", collocation: "contradict sb / each other；contradict itself", diff: "名词 contradiction。self-contradictory＝自相矛盾的。" },
        { lemma: "formulate", pos: "v.", ipa: "/ˈfɔːmjuleɪt/", meaning: "制定；构想；表述", inText: "制定（可达标的）目标", collocation: "formulate a policy / a theory / a plan", diff: "强调把想法成体系地表述出来。名词 formulation。" },
        { lemma: "manipulate", pos: "v.", ipa: "/məˈnɪpjuleɪt/", meaning: "操纵；操控", inText: "操纵新闻稿的措辞", collocation: "manipulate data / public opinion / sb into doing", diff: "贬义，比 handle 多了“暗中手法”的意味。名词 manipulation。" }
      ]
    },

    {
      id: "b02",
      title: "The Ground Beneath the Harvest",
      titleZh: "收成之下的土地",
      genre: "科普说明文",
      field: "science",
      date: "2026-11-10",
      note: "土壤退化与再生农业；考试科普、环境类常见题材，本批 24 个动词都放在同一场景里。",

      paragraphs: [
        {
          en: "Soil is the least dramatic of natural resources and the easiest to take for granted. It forms at roughly a centimeter a century, yet it can be lost in a single careless season. Agronomists who study the chemistry that [[underlies|underlie]] fertility have warned for decades that the processes are slow and poorly mapped: the microbes that [[multiply]] in healthy ground, the fungi that bind it into crumbs, the minerals that feed a root. Where fields are worked without rest, the land continues to [[deteriorate]], and the harvests that once [[sustained|sustain]] a district begin to shrink.",
          zh: "土壤是最不起眼的自然资源，也最容易被视作理所当然。它大约一个世纪才形成一厘米，却可能在一个粗心的季节里流失。研究**构成**肥力基础的化学过程的农学家，几十年来一直提醒：这些过程既缓慢又没摸清——在健康土壤里**繁殖**的微生物、把土粒黏成团粒的真菌、供养根系的矿物质。凡是让土地得不到休整、反复耕作的地方，土地便持续**退化**，曾经**维持**一县生计的收成也开始减少。"
        },
        {
          en: "The remedies are unglamorous. Growers who [[substitute]] compost for synthetic fertilizer, [[fertilize]] less often and [[implement]] simple rotations report that tired fields [[revive]] within three seasons. Trials across the valley [[demonstrate]] that such plots [[outperform]] neighboring ones in dry years, and extension officers, once skeptical, have begun to [[endorse]] the practice. What [[propels|propel]] it is not romance but arithmetic: a grower who spends less on inputs and loses less to drought has little reason to go back.",
          zh: "补救办法并不光鲜。用堆肥**替代**合成化肥、减少**施肥**次数、**实施**简单轮作的种植者说，疲惫的田地三个季节内就能**复苏**。谷地各处的试验**表明**，这类地块在干旱年份**表现优于**邻近地块；曾经怀疑的推广人员也开始**支持**这种做法。**推动**它的不是情怀，而是算术：投入更少、旱灾损失更小的农户，没有理由走回头路。"
        },
        {
          en: "Institutions decide whether that arithmetic reaches the field. Certification bodies [[certify]] produce only after years of inspection, and only a scheme that [[compensates|compensate]] growers for the lean transitional years is likely to keep them. When governments [[withdraw]] support too early, adoption stalls within a season. The valley's cooperative [[nominated|nominate]] one grower to [[prolong]] the trial for a further five years; neighbors [[reckon]] he will be vindicated, though few would say so in public.",
          zh: "制度决定这套算术能否落到田间。认证机构要经过多年检查才**认证**产品，而只有**补偿**种植者度过转型歉收年的方案，才可能把他们留住。政府若过早**撤回**支持，采纳率一个季度内就会停滞。谷地的合作社**提名**一位种植者把试验再**延长**五年；邻居们**认为**他终会被证明是对的，只是很少有人在公开场合这么说。"
        },
        {
          en: "Advocates should be careful here. Enthusiasm sometimes [[exaggerates|exaggerate]] the gains, and satellite images, which [[illuminate]] the pattern of recovery, cannot explain why one field responds and another does not. There is no need to [[dwell]] on the chemistry to see the point: a soil is a slow account, and every harvest is a withdrawal. Some researchers have [[relocated|relocate]] their trials to drier ground; a few have [[dedicated|dedicate]] a decade to the question. What they are really testing [[transcends|transcend]] agriculture: whether any of us can be persuaded to pay now for a benefit we will not live to collect.",
          zh: "倡导者在这里要谨慎。热情有时会**夸大**收益；能**照见**恢复格局的卫星图像，也解释不了一块地为何有反应、另一块为何没有。不必**细究**化学，道理也清楚：土壤是一本缓慢的账，每一次收成都是支取。一些研究者已把试验**迁移**到更干旱的地方，还有几位把十年**献给**了这个问题。他们真正在检验的东西**超越**了农业本身：我们是否愿意为一项自己活不到享受的收益，现在就付钱。"
        }
      ],

      focus: [
        "substitute A for B",
        "outperform expectations",
        "dwell on the details",
        "compensate for the loss",
        "sustain growth",
        "withdraw support",
        "transcend boundaries"
      ],

      words: [
        { lemma: "revive", pos: "v.", ipa: "/rɪˈvaɪv/", meaning: "复苏；恢复生机；重新流行", inText: "疲惫的田地三个季节内复苏", collocation: "revive the land / the economy / a tradition", diff: "名词 revival。和 survive 只差一个字母：re-（再）+ vive（活），指“让活过来”，不是“活着”。" },
        { lemma: "demonstrate", pos: "v.", ipa: "/ˈdemənstreɪt/", meaning: "证明；演示；示威", inText: "试验表明", collocation: "demonstrate that… / demonstrate how to do sth", diff: "名词 demonstration。比 show 正式，实验证据几乎都用它。" },
        { lemma: "nominate", pos: "v.", ipa: "/ˈnɒmɪneɪt/", meaning: "提名；任命", inText: "合作社提名一位种植者", collocation: "nominate sb for / as…", diff: "名词 nomination。与 appoint 的区别：nominate 偏“提名待定”，appoint 是“任命到岗”。" },
        { lemma: "outperform", pos: "v.", ipa: "/ˌaʊtpəˈfɔːm/", meaning: "表现优于；胜过", inText: "表现优于邻近地块", collocation: "outperform a rival / expectations", diff: "out- 表“超过”，同族 outnumber（数量超过）、outlive（比…活得久）、outweigh（比…更重要）。" },
        { lemma: "endorse", pos: "v.", ipa: "/ɪnˈdɔːs/", meaning: "支持；为…背书；在背面签名", inText: "推广人员开始支持这种做法", collocation: "endorse a plan / a candidate", diff: "名词 endorsement。原义是支票背面签字，所以带“背书担保”的意味。" },
        { lemma: "dwell", pos: "v.", ipa: "/dwel/", meaning: "居住；细想、反复琢磨", inText: "不必细究化学原理", collocation: "dwell on / upon sth；dwell in", diff: "过去式 dwelt 或 dwelled。阅读几乎都考 dwell on＝反复纠结，多带贬义。" },
        { lemma: "dedicate", pos: "v.", ipa: "/ˈdedɪkeɪt/", meaning: "致力于；献给", inText: "把十年献给这个问题", collocation: "dedicate oneself / sth to…", diff: "形容词 dedicated（专注的、专用的）。注意 be dedicated to doing，to 是介词。" },
        { lemma: "fertilize", pos: "v.", ipa: "/ˈfɜːtəlaɪz/", meaning: "施肥；使受精", inText: "减少施肥次数", collocation: "fertilize the soil / crops", diff: "名词 fertilizer（化肥）、fertility（肥力）。英式也拼作 fertilise。" },
        { lemma: "illuminate", pos: "v.", ipa: "/ɪˈluːmɪneɪt/", meaning: "照亮；阐明", inText: "卫星图像照见恢复格局", collocation: "illuminate a subject / the issue", diff: "名词 illumination。由“照亮”引申为“使问题清楚”，阅读常考。" },
        { lemma: "withdraw", pos: "v.", ipa: "/wɪðˈdrɔː/", meaning: "撤回；退出；取（钱）", inText: "政府过早撤回支持", collocation: "withdraw support / an offer；withdraw from", diff: "名词 withdrawal。过去式 withdrew，过去分词 withdrawn。" },
        { lemma: "substitute", pos: "v.", ipa: "/ˈsʌbstɪtjuːt/", meaning: "用…替代；n. 替代品", inText: "用堆肥替代合成化肥", collocation: "substitute A for B", diff: "方向最容易错：substitute A for B＝用 A 代替 B，等于 replace B with A。名词 substitution。" },
        { lemma: "implement", pos: "v.", ipa: "/ˈɪmplɪment/", meaning: "实施；执行", inText: "实施简单的轮作", collocation: "implement a policy / a plan / a reform", diff: "作名词时重音前移 /ˈɪmplɪmənt/，指“工具、器具”。" },
        { lemma: "propel", pos: "v.", ipa: "/prəˈpel/", meaning: "推动；驱使", inText: "推动它的是算术而非情怀", collocation: "propel sb/sth forward / into", diff: "名词 propulsion。比 push 更强调持续向前。" },
        { lemma: "reckon", pos: "v.", ipa: "/ˈrekən/", meaning: "认为；估算", inText: "邻居们认为他终会被证明是对的", collocation: "reckon that…；reckon on sth", diff: "口语里 I reckon＝我觉得；阅读里常作“估计、推断”。" },
        { lemma: "deteriorate", pos: "v.", ipa: "/dɪˈtɪəriəreɪt/", meaning: "恶化；退化", inText: "土地持续退化", collocation: "conditions deteriorate；deteriorate into", diff: "名词 deterioration。比 worsen 正式，反义 improve。" },
        { lemma: "sustain", pos: "v.", ipa: "/səˈsteɪn/", meaning: "维持；支撑；遭受（损失）", inText: "曾维持一县生计的收成", collocation: "sustain growth / life / a loss", diff: "形容词 sustainable 是作文高频词，兼“可持续的”和“可承受的”两义。" },
        { lemma: "certify", pos: "v.", ipa: "/ˈsɜːtɪfaɪ/", meaning: "认证；正式证明", inText: "认证机构认证产品", collocation: "certify that…；be certified as", diff: "名词 certification，形容词 certified（持证的）。" },
        { lemma: "prolong", pos: "v.", ipa: "/prəˈlɒŋ/", meaning: "延长", inText: "把试验再延长五年", collocation: "prolong life / a stay / the process", diff: "名词 prolongation。与 lengthen 近义，prolong 多指“让持续时间变长”。" },
        { lemma: "compensate", pos: "v.", ipa: "/ˈkɒmpenseɪt/", meaning: "补偿；弥补", inText: "补偿种植者转型期的损失", collocation: "compensate sb for sth；compensate for", diff: "名词 compensation。compensate for 后面接“缺失的东西”，不接人。" },
        { lemma: "multiply", pos: "v.", ipa: "/ˈmʌltɪplaɪ/", meaning: "繁殖；成倍增加；乘", inText: "微生物在健康土壤里繁殖", collocation: "multiply rapidly；multiply A by B", diff: "名词 multiplication。本义是“乘”，所以自带“成倍”的画面。" },
        { lemma: "underlie", pos: "v.", ipa: "/ˌʌndəˈlaɪ/", meaning: "构成…的基础；是…的根源", inText: "构成肥力基础的化学过程", collocation: "the factors that underlie…", diff: "过去式 underlay，分词 underlying。形容词 underlying＝潜在的、根本的，高频。" },
        { lemma: "relocate", pos: "v.", ipa: "/ˌriːləʊˈkeɪt/", meaning: "迁移；重新安置", inText: "把试验迁到更干旱的地方", collocation: "relocate to…；relocate staff", diff: "名词 relocation。re-（再）+ locate（安置）。" },
        { lemma: "exaggerate", pos: "v.", ipa: "/ɪɡˈzædʒəreɪt/", meaning: "夸大", inText: "热情有时会夸大收益", collocation: "exaggerate the benefits / importance", diff: "名词 exaggeration，形容词 exaggerated（夸张的）。" },
        { lemma: "transcend", pos: "v.", ipa: "/trænˈsend/", meaning: "超越；超出（范围）", inText: "超越农业本身", collocation: "transcend boundaries / differences", diff: "名词 transcendence。trans-（越过）+ scandere（攀登），画面是“翻过去”。" }
      ]
    },

    {
      id: "b03",
      title: "After the Storm, the Marsh",
      titleZh: "风暴之后，湿地",
      genre: "六级说明文",
      field: "climate",
      date: "2026-11-11",
      note: "飓风过后的海岸修复：湿地、买断与重建。气候类阅读常用场景，23 个词串在同一条线索上。",

      paragraphs: [
        {
          en: "When the [[hurricane]] came ashore, the town learned in a single night what its engineers had been saying for years. The barrier beach had been [[retreating|retreat]] by a metre a decade, its sediment supply [[depleted|deplete]] by dams upstream, and the low ground behind it — a retail park, a [[warehouse]], a row of [[retailers|retailer]], a [[segment]] of the coast road — stood exactly where the surge wanted to go. The damage was not evenly spread. Properties behind an intact marsh lost far less than those behind a sea wall, and by the third week the town's reserve fund was close to [[exhaustion]].",
          zh: "飓风登陆那一夜，小镇一夜之间明白了工程师们说了多年的话。障壁海滩一直以每十年一米的速度**后退**，上游水坝截走了泥沙，沙源日渐**枯竭**；它身后的低地——一个零售园区、一座**仓库**、一排**零售商**、一段海岸公路——恰好位于风暴增水要去的地方。损失并不均匀：完好湿地后面的房产，损失远小于海堤后面的房产；到第三周，镇上的储备金已经接近**耗尽**。"
        },
        {
          en: "Ecologists had argued for a decade that the marsh mattered. Their working [[hypothesis]] was simple: a wide band of reeds and mud flats absorbs wave energy that a wall merely deflects. It was an awkward claim to [[verify]], because no two storms arrive the same way; the best evidence came from models that ran the same [[scenario]] with and without the marsh. When federal [[stimulus]] money finally arrived, the county chose to [[leverage]] it into land acquisition rather than concrete, and to most residents the result was a [[glimpse]] of what a coastline might look like if it were allowed to move.",
          zh: "生态学家十年来一直主张，湿地是有用的。他们的工作**假说**很简单：宽阔的芦苇带和泥滩能吸收波浪能量，而海堤只是把能量弹开。这个说法很难**验证**，因为没有两次风暴以同样方式到来；最好的证据来自模型——在同一个**情景**下分别保留和移除湿地。联邦**刺激**资金终于到位时，县里选择用它**撬动**土地收购，而不是浇筑混凝土；对多数居民来说，这让他们**瞥见**了一种可能：如果海岸被允许移动，它会是什么样子。"
        },
        {
          en: "Restoration, however, is a test of local [[democracy]] as much as of ecology. The [[justification]] for buying out waterfront owners was straightforward — the state could not insure what it could not defend — yet the [[stigma]] attached to accepting the offer kept some families away for years. Land [[tenure]] complicated every file: some parcels had been in the same family for four generations and had no clear title. Officials learned to trade on the [[prestige]] of a national designation, and [[enrollment]] in the buyout scheme rose once a neighbour had signed.",
          zh: "然而，修复既是生态问题，也是对地方**民主**的考验。收购滨水业主房产的**理由**很直白——州政府无法为它守不住的东西承保——但接受这笔钱所带的**污名**，让一些家庭多年不愿点头。土地**权属**让每一份档案都变得复杂：有些地块在同一家族手里传了四代，却没有清晰的产权。官员们学会借国家命名的**声望**做工作，而一旦有邻居签了字，买断方案的**报名**人数就上来了。"
        },
        {
          en: "The marsh, meanwhile, did what marshes do. Within two seasons the [[predators|predator]] returned — herons, otters, a pair of ospreys — and the recovery looked less like engineering than like a quiet [[resurrection]]. A field [[expedition]] from the university now measures the mud each spring; the students' numbers are unglamorous and, so far, encouraging. The harder question is one of [[rationality]]: knowing what the town now knows, is it reasonable to rebuild in the same place, and who should pay for the answer?",
          zh: "与此同时，湿地做了湿地该做的事。两个季节之内，**捕食者**回来了——苍鹭、水獭、一对鱼鹰——这场恢复看起来不太像工程，更像一次安静的**复活**。大学的野外**考察**队现在每年春天测量泥滩；学生们的数据并不好看，但至今是令人鼓舞的。更难的问题关乎**合理性**：既然知道了现在知道的事，在原地重建还说得过去吗？又该由谁来为这个答案付账？"
        }
      ],

      focus: [
        "a worst-case scenario",
        "deplete resources",
        "catch a glimpse of",
        "leverage sth into",
        "the justification for",
        "the stigma attached to"
      ],

      words: [
        { lemma: "verify", pos: "v.", ipa: "/ˈverɪfaɪ/", meaning: "核实；证明；验证", inText: "验证（这个假说）", collocation: "verify that…；verify the data / a claim", diff: "名词 verification。比 confirm 更强调“查证过程”，新闻和学术里常用。" },
        { lemma: "deplete", pos: "v.", ipa: "/dɪˈpliːt/", meaning: "耗尽；使枯竭", inText: "沙源枯竭", collocation: "deplete resources / stocks / the ozone layer", diff: "名词 depletion。比 use up 正式，多用于自然资源、储备。" },
        { lemma: "glimpse", pos: "n./v.", ipa: "/ɡlɪmps/", meaning: "一瞥；瞥见", inText: "瞥见海岸的另一种可能", collocation: "catch a glimpse of；a glimpse into", diff: "与 glance 区别：glance 是“看一眼”的动作，glimpse 强调“看到的瞬间”，常带“难得一见”的意味。" },
        { lemma: "scenario", pos: "n.", ipa: "/səˈnɑːriəʊ/", meaning: "设想；情景；可能发生的情况", inText: "同一种情景下的对照模拟", collocation: "a worst-case scenario；under this scenario", diff: "复数是 scenarios。阅读里常出现在“做预测、做假设”的段落。" },
        { lemma: "stimulus", pos: "n.", ipa: "/ˈstɪmjələs/", meaning: "刺激（物）；刺激政策", inText: "联邦刺激资金", collocation: "economic / fiscal stimulus；a stimulus to growth", diff: "复数 stimuli。形容词 stimulating。经济语境里就是“刺激计划”。" },
        { lemma: "hypothesis", pos: "n.", ipa: "/haɪˈpɒθəsɪs/", meaning: "假说；假设", inText: "湿地吸收波能的假说", collocation: "test / support / reject a hypothesis", diff: "复数 hypotheses。比 theory 弱一级：假说尚待验证，理论已有较多证据。" },
        { lemma: "prestige", pos: "n.", ipa: "/preˈstiːʒ/", meaning: "声望；威信", inText: "国家命名的声望", collocation: "high prestige；a prestige project", diff: "形容词 prestigious（有声望的），六级阅读里形容大学、奖项的高频词。" },
        { lemma: "tenure", pos: "n.", ipa: "/ˈtenjə/", meaning: "任期；（终身）教职；土地权属", inText: "土地权属", collocation: "land tenure；academic tenure", diff: "两个高频义项：大学里的“终身教职”，以及 land tenure＝土地权属，本批用的后者。" },
        { lemma: "resurrection", pos: "n.", ipa: "/ˌrezəˈrekʃn/", meaning: "复活；复兴", inText: "湿地安静的“复活”", collocation: "the resurrection of…", diff: "动词 resurrect。除宗教义外，常比喻“使衰败之物重新兴起”。" },
        { lemma: "predator", pos: "n.", ipa: "/ˈpredətə/", meaning: "捕食者；掠夺者", inText: "苍鹭、水獭等捕食者回归", collocation: "predator and prey；a natural predator", diff: "形容词 predatory（掠夺性的），商业语境里指“恶意收购”。" },
        { lemma: "rationality", pos: "n.", ipa: "/ˌræʃəˈnæləti/", meaning: "合理性；理性", inText: "在原地重建是否合理", collocation: "bounded rationality；economic rationality", diff: "形容词 rational。bounded rationality＝有限理性，是经济学里的固定说法。" },
        { lemma: "retreat", pos: "v./n.", ipa: "/rɪˈtriːt/", meaning: "后退；撤退；退缩；静修处", inText: "障壁海滩不断后退", collocation: "retreat from；the retreat of glaciers", diff: "既可指军队撤退，也可指海岸线、冰川“后退”，阅读里后者更常见。" },
        { lemma: "leverage", pos: "v./n.", ipa: "/ˈliːvərɪdʒ/", meaning: "利用；撬动；杠杆作用", inText: "用联邦资金撬动土地收购", collocation: "leverage sth to do sth；financial leverage", diff: "本义“杠杆”，动词义“用有限资源撬动更大成果”，六级作文很好用。" },
        { lemma: "warehouse", pos: "n.", ipa: "/ˈweəhaʊs/", meaning: "仓库", inText: "建在填埋湿地上的仓库", collocation: "a distribution warehouse；warehouse club", diff: "warehouse club 指仓储式卖场；注意重音在前。" },
        { lemma: "democracy", pos: "n.", ipa: "/dɪˈmɒkrəsi/", meaning: "民主；民主制度", inText: "对地方民主的考验", collocation: "local democracy；a democratic process", diff: "形容词 democratic。阅读里常与 accountability、participation 一起出现。" },
        { lemma: "segment", pos: "n./v.", ipa: "/ˈseɡmənt/", meaning: "部分；段；细分市场", inText: "一段海岸公路", collocation: "a segment of；market segment", diff: "作动词读 /seɡˈment/，指“分割”。商业语境里 market segment＝细分市场。" },
        { lemma: "justification", pos: "n.", ipa: "/ˌdʒʌstɪfɪˈkeɪʃn/", meaning: "理由；正当性", inText: "收购房产的理由", collocation: "the justification for sth / doing sth", diff: "动词 justify。写作里用来“给出理由”，比 reason 更强调“是否站得住”。" },
        { lemma: "exhaustion", pos: "n.", ipa: "/ɪɡˈzɔːstʃən/", meaning: "精疲力竭；耗尽", inText: "储备金接近耗尽", collocation: "physical exhaustion；the exhaustion of reserves", diff: "动词 exhaust。既指人的疲惫，也指资源的耗尽，看主语判断。" },
        { lemma: "hurricane", pos: "n.", ipa: "/ˈhʌrɪkən/", meaning: "飓风", inText: "登陆的飓风", collocation: "hurricane season；a category-4 hurricane", diff: "地域区别要记：大西洋叫 hurricane，太平洋叫 typhoon，印度洋叫 cyclone。" },
        { lemma: "enrollment", pos: "n.", ipa: "/ɪnˈrəʊlmənt/", meaning: "登记；报名；入学人数", inText: "买断方案的报名人数", collocation: "enrollment in；school enrollment", diff: "美式拼写 enrollment，英式 enrolment。阅读里常指“参与人数”。" },
        { lemma: "retailer", pos: "n.", ipa: "/ˈriːteɪlə/", meaning: "零售商", inText: "沿岸的一排零售商", collocation: "a high-street retailer；online retailers", diff: "与 wholesaler（批发商）相对；retail 是零售，动词也作“零售”。" },
        { lemma: "expedition", pos: "n.", ipa: "/ˌekspəˈdɪʃn/", meaning: "远征；考察（队）", inText: "大学的野外考察", collocation: "go on an expedition；a scientific expedition", diff: "与 trip 比更正式，带“有目的的远行”，科学考察常用它。" },
        { lemma: "stigma", pos: "n.", ipa: "/ˈstɪɡmə/", meaning: "污名；耻辱", inText: "接受买断所带的污名", collocation: "the stigma attached to / associated with sth", diff: "动词 stigmatize。社会类阅读高频：the stigma of mental illness / of poverty。" }
      ]
    }
  ]
};
