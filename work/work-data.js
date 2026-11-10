/* 项目内容 — 每个模块一条
   字段：title / tag / year / lead / meta / body / items
   item: { type: 'image'|'video'|'file', src, title, note, size }
   加模块：复制一条，往 media/ 里放文件即可，页面不用改。 */

const WORK = {
  modeling: {
    title: '数学建模竞赛',
    tag: '论文',
    year: '2025 — 2026',
    lead: '从校赛到国赛、美赛，六篇论文完整归档。',
    meta: [
      ['角色', '建模、编程、写作'],
      ['工具', 'Python · MATLAB · LaTeX'],
      ['赛题类型', '评价、优化、预测']
    ],
    body: [
      '习惯是三个人分头做：一个人把题读厚再读薄，一个人搭模型写代码，一个人盯论文的骨架。真正难的不是套方法，是在四十多个小时里判断哪条路值得走完。',
      '校赛练的是速度，国赛练的是稳，美赛练的是把话说清楚。这几篇论文风格不一样，早期偏堆方法，后面几篇更愿意花篇幅解释假设为什么成立、结果在什么条件下会崩。'
    ],
    items: [
      { type: 'file', src: 'media/modeling/25-guosai.pdf', title: '2025 全国大学生数学建模竞赛', note: '国赛', size: 2140 * 1024 },
      { type: 'file', src: 'media/modeling/25-guosai-school-a.pdf', title: '2025 国赛校赛 A 题', note: '校赛', size: 1559 * 1024 },
      { type: 'file', src: 'media/modeling/26-guosai.pdf', title: '2026 全国大学生数学建模竞赛', note: '国赛', size: 2050 * 1024 },
      { type: 'file', src: 'media/modeling/26-guosai-school.pdf', title: '2026 国赛校赛', note: '校赛', size: 4646 * 1024 },
      { type: 'file', src: 'media/modeling/26-meisai.pdf', title: '2026 美国大学生数学建模竞赛', note: '美赛', size: 7118 * 1024 },
      { type: 'file', src: 'media/modeling/26-meisai-school.pdf', title: '2026 美赛校赛', note: '校赛', size: 6729 * 1024 }
    ]
  },

  rl: {
    title: '类脑强化学习',
    tag: '软著',
    year: '2026',
    lead: '基于 PPO 与自注意力机制的 Pong 智能体，已登记软件著作权。',
    meta: [
      ['角色', '算法与实现'],
      ['方法', 'PPO · Self-Attention · 稀疏表征'],
      ['软著登记号', '2026SR0601239']
    ],
    body: [
      '方向是从"类脑"这边切进去的：人看屏幕上的球，不会逐像素处理，而是抓少数几个显著位置。所以试着把自注意力放在帧特征上做稀疏化，再交给 PPO 决策，看能不能用更少的样本学到同样的策略。',
      'Pong 只是最小的试验台——状态简单、奖励稀疏、胜负清楚。真正想验证的是：注意力挑出来的位置，和人类看球时会盯的地方是否重合。这一点还在做。'
    ],
    items: [
      { type: 'image', src: 'media/rl/copyright.jpg', title: '软件著作权登记证书', note: '国家版权局 · 2026SR0601239' },
      { type: 'file', src: 'media/rl/pong-manual.pdf', title: '软件说明书', note: 'PDF', size: 719 * 1024 },
      { type: 'video', src: 'media/rl/pong-demo.mp4', title: 'Pong 智能体运行演示' }
    ]
  },

  dsa: {
    title: 'CT 协议 DSA 路径规划',
    tag: '系统',
    year: '2026',
    lead: '低剂量介入下的 CT-DSA 虚实联动路径仿真与智能寻角控制。',
    meta: [
      ['角色', '路径规划与仿真'],
      ['场景', '心脑血管介入'],
      ['关键词', '血管分割 · 入路约束 · 角度优化']
    ],
    body: [
      '介入手术里，C 臂要绕病人转到一个"看得清"的角度，同时尽量少扫、少造影剂。这件事拆开是三步：把血管从影像里分出来，判断针/导管能不能从这条路径进去，再在所有可行角度里挑代价最小的那几个。',
      '系统做成虚实联动：虚拟端在重建的血管模型上搜索路径和角度，真实端按同样的协议驱动扫描，两边用同一套坐标系核对。下面两份材料是论文和获奖证书，视频是仿真过程。'
    ],
    items: [
      { type: 'image', src: 'media/dsa/poster.jpg', title: '项目海报', note: '系统总览' },
      { type: 'file', src: 'media/dsa/paper.pdf', title: '面向低剂量介入的 CT-DSA 虚实联动路径仿真与智能寻角控制系统', note: '论文', size: 2779 * 1024 },
      { type: 'file', src: 'media/dsa/award.pdf', title: '获奖证书', note: 'PDF', size: 1769 * 1024 },
      { type: 'video', src: 'media/dsa/demo-1.mp4', title: '虚实联动仿真' },
      { type: 'video', src: 'media/dsa/demo-2.mp4', title: '路径与角度演示' }
    ]
  },

  car: {
    title: '智能车',
    tag: '作品',
    year: '2026',
    lead: '摄像头循迹的履带小车：看线、找中线、打角。',
    meta: [
      ['角色', '整车搭建与调试'],
      ['硬件', '履带底盘 · 舵机 · 摄像头'],
      ['算法', '二值化 · 中线提取 · PID']
    ],
    body: [
      '车不大，事不少。摄像头一行行读回来的是灰度，先二值化把赛道抠出来，再按行找黑线中心，得到一条中线；中线相对车头的偏移喂给 PID，输出舵机角度和差速。',
      '调参比写代码花时间：直道要稳、弯道要敢打、出弯不能振。履带底盘打滑少，但对地面很敏感，同一套参数在木地板和地砖上是两回事。'
    ],
    items: [
      { type: 'image', src: 'media/car/car-1.jpg', title: '整车', note: '履带底盘 + 摄像头' },
      { type: 'image', src: 'media/car/car-2.jpg', title: '传感器与支架', note: '细节' },
      { type: 'image', src: 'media/car/car-3.jpg', title: '车身', note: '调试中' },
      { type: 'image', src: 'media/car/car-4.jpg', title: '赛道测试', note: '现场' },
      { type: 'video', src: 'media/car/car-run.mp4', title: '循迹运行' }
    ]
  },

  lab: {
    title: '一些有趣的实验',
    tag: '动手',
    year: '2025 — 2026',
    lead: '3D 打印、激光雕刻、光固化——不务正业但很有用的那种。',
    meta: [
      ['设备', 'FDM 打印机 · 激光雕刻机 · UV 固化'],
      ['材料', 'PLA · 椴木板 · 光敏树脂'],
      ['产出', '一堆小东西']
    ],
    body: [
      '这些实验没有论文，也没有验收标准，纯粹是想看看"能不能做出来"。做出来之后通常会发现：能，但要花三倍时间。',
      '下面几张是留下的记录：打印的三星堆面具、激光雕的木板、紫光下固化的徽章。模型大多是从公开模型改的，切片参数自己调。'
    ],
    items: [
      { type: 'image', src: 'media/lab/lab-1.jpg', title: '3D 打印 · 三星堆面具', note: 'PLA，分件打印后拼接' },
      { type: 'image', src: 'media/lab/lab-2.jpg', title: '光固化 · 校庆徽章', note: 'UV 固化，紫光下' },
      { type: 'image', src: 'media/lab/lab-3.jpg', title: '激光雕刻 · 木板', note: '椴木，300dpi 扫描线' },
      { type: 'image', src: 'media/lab/lab-4.jpg', title: '实验记录 04' },
      { type: 'image', src: 'media/lab/lab-5.jpg', title: '实验记录 05' },
      { type: 'image', src: 'media/lab/lab-6.jpg', title: '实验记录 06' },
      { type: 'image', src: 'media/lab/lab-7.jpg', title: '实验记录 07' },
      { type: 'image', src: 'media/lab/lab-8.jpg', title: '实验记录 08' },
      { type: 'image', src: 'media/lab/lab-9.jpg', title: '实验记录 09' },
      { type: 'image', src: 'media/lab/lab-10.jpg', title: '实验记录 10' }
    ]
  },

  surgery: {
    title: '手术机器人',
    tag: '模块',
    year: '',
    lead: '机构、控制与精度验证的记录，还在整理。',
    meta: [['状态', '整理中']],
    body: [],
    items: []
  },

  course: {
    title: '课程相关',
    tag: '课程',
    year: '',
    lead: '课程作业、实验报告和笔记，整理中。',
    meta: [['状态', '整理中']],
    body: [],
    items: []
  }
};
