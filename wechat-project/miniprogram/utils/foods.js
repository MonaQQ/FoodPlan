const FOODS = [
  {
    id: 'bok-choy',
    name: '清炒小白菜',
    calories: 35,
    trafficLight: 'green',
    type: 'vegetarian',
    seasons: ['spring', 'summer'],
    dateTags: ['weekday', 'weekend'],
    description: '爽脆低脂，富含维生素C与纤维。',
    nutrients: ['维生素C', '钾'],
    ingredients: ['小白菜', '蒜末', '橄榄油', '盐'],
    cookingMethod: '快火短炒保留菜叶脆度，是换季时的清爽配菜。',
    bestTime: '午餐/晚餐',
    cookingSteps: [
      { title: '焯洗沥干', duration: '3分钟', detail: '小白菜洗净，沸水快速焯 15 秒后沥干备用。' },
      { title: '爆香蒜末', duration: '1分钟', detail: '起锅倒入橄榄油，小火爆香蒜末。' },
      { title: '大火快炒', duration: '2分钟', detail: '转大火放入小白菜，调盐快速翻炒断生即可出锅。' }
    ]
  },
  {
    id: 'tomato-egg',
    name: '番茄炒蛋',
    calories: 110,
    trafficLight: 'yellow',
    type: 'vegetarian',
    seasons: ['spring', 'summer', 'autumn', 'winter'],
    dateTags: ['weekday', 'weekend'],
    description: '经典家常菜，酸甜开胃，蛋白质充足。',
    nutrients: ['蛋白质', '番茄红素'],
    ingredients: ['番茄', '鸡蛋', '香葱', '盐', '白糖'],
    cookingMethod: '鸡蛋分次处理保持松软，番茄炒出汁后再合炒。',
    bestTime: '早餐/晚餐',
    cookingSteps: [
      { title: '炒蛋定型', duration: '2分钟', detail: '鸡蛋加少许盐打散，下锅炒至半熟盛出。' },
      { title: '番茄出汁', duration: '3分钟', detail: '原锅放少许油，番茄块加糖炒至出汁。' },
      { title: '合炒收汁', duration: '1分钟', detail: '倒回鸡蛋，翻炒均匀即可关火撒葱花。' }
    ]
  },
  {
    id: 'lotus-salad',
    name: '清拌莲藕',
    calories: 70,
    trafficLight: 'green',
    type: 'vegetarian',
    seasons: ['summer', 'autumn'],
    dateTags: ['weekday', 'weekend', 'festival'],
    description: '藕片爽脆，热量低，富含膳食纤维。',
    nutrients: ['膳食纤维', '维生素B6'],
    ingredients: ['莲藕', '香醋', '芝麻油', '小米椒'],
    cookingMethod: '莲藕焯水冰镇锁住脆度，再拌入酸辣汁。',
    bestTime: '午餐配菜',
    cookingSteps: [
      { title: '切片焯水', duration: '4分钟', detail: '莲藕去皮切片，入沸水焯 1 分钟立刻冰镇。' },
      { title: '调汁', duration: '2分钟', detail: '香醋、芝麻油、盐与糖调成酸辣汁，加入小米椒圈。' },
      { title: '拌匀静置', duration: '5分钟', detail: '藕片与调味汁充分拌匀，静置入味后食用。' }
    ]
  },
  {
    id: 'mapo-tofu',
    name: '麻婆豆腐',
    calories: 150,
    trafficLight: 'yellow',
    type: 'meat',
    seasons: ['winter', 'autumn'],
    dateTags: ['weekday', 'weekend'],
    description: '川味经典，豆瓣与牛肉末带来浓郁口感。',
    nutrients: ['蛋白质', '钙'],
    ingredients: ['北豆腐', '牛肉末', '郫县豆瓣', '花椒粉'],
    cookingMethod: '豆瓣酱炒香后小火收汁，最后撒花椒粉提香。',
    bestTime: '晚餐',
    cookingSteps: [
      { title: '煸香牛肉', duration: '3分钟', detail: '平底锅放油，牛肉末煸至出香。' },
      { title: '炒酱入味', duration: '4分钟', detail: '加入豆瓣与豆豉炒出红油，倒入豆腐和高汤。' },
      { title: '勾芡撒椒', duration: '2分钟', detail: '收汁勾薄芡，起锅前撒花椒粉与葱花。' }
    ]
  },
  {
    id: 'beef-noodle',
    name: '番茄牛腩面',
    calories: 320,
    trafficLight: 'red',
    type: 'meat',
    seasons: ['winter', 'autumn'],
    dateTags: ['weekend', 'festival'],
    description: '暖身主食，适合寒冷季节补充能量。',
    nutrients: ['铁', '蛋白质'],
    ingredients: ['牛腩', '番茄', '洋葱', '手擀面'],
    cookingMethod: '番茄炖汤后浇在面条上，汤浓面滑。',
    bestTime: '周末午餐',
    cookingSteps: [
      { title: '牛腩焯水', duration: '8分钟', detail: '牛腩冷水下锅焯去浮沫，捞出备用。' },
      { title: '番茄炖煮', duration: '60分钟', detail: '牛腩与番茄、洋葱、香料同炖至软烂。' },
      { title: '煮面装碗', duration: '5分钟', detail: '手擀面煮熟过凉，浇上炖汤并加青菜。' }
    ]
  },
  {
    id: 'salmon-bowl',
    name: '三文鱼杂粮饭',
    calories: 280,
    trafficLight: 'yellow',
    type: 'meat',
    seasons: ['spring', 'summer'],
    dateTags: ['weekday', 'weekend'],
    description: '优质脂肪搭配复合碳水，均衡营养。',
    nutrients: ['Omega-3', '蛋白质'],
    ingredients: ['三文鱼柳', '糙米', '藜麦', '牛油果'],
    cookingMethod: '煎烤双面微焦，搭配杂粮饭和平衡蔬果。',
    bestTime: '健身后餐',
    cookingSteps: [
      { title: '煮杂粮饭', duration: '30分钟', detail: '糙米与藜麦 1:1 清洗后加水煮熟。' },
      { title: '煎三文鱼', duration: '6分钟', detail: '鱼柳抹盐胡椒，平底锅中火煎至两面金黄。' },
      { title: '装盘调味', duration: '4分钟', detail: '碗底铺饭，配上牛油果与蔬菜，淋柠檬汁。' }
    ]
  },
  {
    id: 'chicken-salad',
    name: '柚子鸡胸沙拉',
    calories: 190,
    trafficLight: 'green',
    type: 'meat',
    seasons: ['summer'],
    dateTags: ['weekday', 'weekend'],
    description: '高蛋白低脂沙拉，含有清爽果香。',
    nutrients: ['蛋白质', '维生素C'],
    ingredients: ['鸡胸肉', '葡萄柚', '生菜', '酸奶酱'],
    cookingMethod: '低温烹调保持鸡胸多汁，与果肉酸甜平衡。',
    bestTime: '清爽晚餐',
    cookingSteps: [
      { title: '水煮鸡胸', duration: '15分钟', detail: '鸡胸入 75℃ 热水浸煮 12 分钟取出放凉。' },
      { title: '拆柚拌汁', duration: '5分钟', detail: '葡萄柚拆成小块，酸奶加蜂蜜调成酱。' },
      { title: '拼盘拌匀', duration: '3分钟', detail: '生菜垫底，加入鸡胸薄片与柚子，淋酱即可。' }
    ]
  },
  {
    id: 'braised-pork',
    name: '红烧肉',
    calories: 420,
    trafficLight: 'red',
    type: 'meat',
    seasons: ['winter', 'autumn'],
    dateTags: ['weekend', 'festival'],
    description: '逢年过节必备的硬菜，脂香四溢。',
    nutrients: ['蛋白质', '脂溶性维生素'],
    ingredients: ['五花肉', '冰糖', '生抽', '老抽', '料酒'],
    cookingMethod: '小火焖煮至软糯，汤汁收浓后油亮透亮。',
    bestTime: '节庆聚餐',
    cookingSteps: [
      { title: '煸炒上色', duration: '6分钟', detail: '五花肉煸出油脂，加入冰糖炒出糖色。' },
      { title: '焖煮入味', duration: '50分钟', detail: '加入调料和热水没过，盖盖小火焖。' },
      { title: '大火收汁', duration: '5分钟', detail: '开盖大火收汁，肉块翻滚至油亮。' }
    ]
  },
  {
    id: 'mushroom-quinoa',
    name: '菌菇藜麦饭',
    calories: 210,
    trafficLight: 'green',
    type: 'vegetarian',
    seasons: ['autumn', 'winter'],
    dateTags: ['weekday', 'weekend'],
    description: '高纤维高蛋白的全植物主食。',
    nutrients: ['膳食纤维', '蛋白质'],
    ingredients: ['藜麦', '香菇', '平菇', '洋葱'],
    cookingMethod: '藜麦吸足高汤，菌菇炒香再合拌。',
    bestTime: '工作日晚餐',
    cookingSteps: [
      { title: '煮藜麦', duration: '20分钟', detail: '藜麦洗净加 1.5 倍水煮至吸干。' },
      { title: '炒菌菇', duration: '5分钟', detail: '多种菌菇与洋葱同炒至出香气。' },
      { title: '拌匀调味', duration: '2分钟', detail: '将菌菇拌入藜麦，调盐和胡椒即可。' }
    ]
  },
  {
    id: 'shrimp-dumpling',
    name: '韭菜虾仁饺子',
    calories: 250,
    trafficLight: 'yellow',
    type: 'meat',
    seasons: ['spring', 'winter'],
    dateTags: ['weekend', 'festival'],
    description: '鲜香饱满，节庆时刻的热门主角。',
    nutrients: ['蛋白质', '叶酸'],
    ingredients: ['虾仁', '韭菜', '鸡蛋', '饺子皮'],
    cookingMethod: '虾仁韭菜馅鲜甜，煮至饺子鼓起即可。',
    bestTime: '团圆餐',
    cookingSteps: [
      { title: '调制馅料', duration: '10分钟', detail: '虾仁切丁加鸡蛋与韭菜搅拌，调味。' },
      { title: '包制饺子', duration: '15分钟', detail: '饺子皮包入馅料捏紧收口。' },
      { title: '煮饺出锅', duration: '6分钟', detail: '沸水中煮至饺子浮起再加冷水一次即可。' }
    ]
  },
  {
    id: 'congee',
    name: '南瓜小米粥',
    calories: 95,
    trafficLight: 'green',
    type: 'vegetarian',
    seasons: ['autumn'],
    dateTags: ['weekday', 'weekend'],
    description: '易消化的暖胃选择，富含β-胡萝卜素。',
    nutrients: ['β-胡萝卜素', 'þ'],
    ingredients: ['南瓜', '小米', '清水'],
    cookingMethod: '南瓜与小米慢火熬煮至糯软。',
    bestTime: '早餐',
    cookingSteps: [
      { title: '南瓜蒸熟', duration: '15分钟', detail: '南瓜切块蒸至软烂。' },
      { title: '熬煮小米', duration: '25分钟', detail: '小米加足量水中小火熬煮。' },
      { title: '合煮成糊', duration: '5分钟', detail: '加入南瓜泥继续搅拌至粥体细腻。' }
    ]
  },
  {
    id: 'stir-fried-okra',
    name: '蒜蓉秋葵',
    calories: 60,
    trafficLight: 'green',
    type: 'vegetarian',
    seasons: ['summer', 'autumn'],
    dateTags: ['weekday', 'weekend'],
    description: '低GI蔬菜，帮助控制血糖波动。',
    nutrients: ['叶酸', '可溶性纤维'],
    ingredients: ['秋葵', '蒜末', '椒盐'],
    cookingMethod: '焯后拌蒜蓉热油，保持鲜嫩。',
    bestTime: '配菜/晚餐',
    cookingSteps: [
      { title: '焯水护色', duration: '3分钟', detail: '秋葵去蒂后焯水 1 分钟，捞出放凉。' },
      { title: '调蒜蓉汁', duration: '2分钟', detail: '蒜末、盐、椒粉调成酱。' },
      { title: '淋油拌匀', duration: '2分钟', detail: '秋葵摆盘淋热油，再浇蒜蓉汁。' }
    ]
  },
  {
    id: 'lamb-pot',
    name: '枸杞羊肉煲',
    calories: 360,
    trafficLight: 'red',
    type: 'meat',
    seasons: ['winter'],
    dateTags: ['weekend', 'festival'],
    description: '冬季滋补首选，暖身驱寒。',
    nutrients: ['铁', '蛋白质'],
    ingredients: ['羊肉', '枸杞', '姜片', '当归'],
    cookingMethod: '药材与羊肉同炖，汤鲜肉嫩。',
    bestTime: '寒冷夜晚',
    cookingSteps: [
      { title: '汆烫羊肉', duration: '6分钟', detail: '羊肉冷水入锅焯去血沫。' },
      { title: '药材同炖', duration: '90分钟', detail: '砂锅中放羊肉、姜片、枸杞与当归慢炖。' },
      { title: '调味出锅', duration: '2分钟', detail: '加盐调味，小火煮 2 分钟即可。' }
    ]
  },
  {
    id: 'sesame-noodle',
    name: '麻酱凉面',
    calories: 290,
    trafficLight: 'yellow',
    type: 'vegetarian',
    seasons: ['summer'],
    dateTags: ['weekday', 'weekend'],
    description: '清爽解暑，芝麻酱香浓，适合快速一餐。',
    nutrients: ['不饱和脂肪酸', '钙'],
    ingredients: ['面条', '芝麻酱', '黄瓜丝', '胡萝卜丝'],
    cookingMethod: '面条过冷水保持弹性，与蔬菜酱汁拌匀。',
    bestTime: '夏日午餐',
    cookingSteps: [
      { title: '煮面降温', duration: '8分钟', detail: '面条煮熟后迅速过冰水。' },
      { title: '调芝麻酱', duration: '3分钟', detail: '芝麻酱加温水和酱油调稀。' },
      { title: '拌面出餐', duration: '2分钟', detail: '加入黄瓜、胡萝卜丝，浇酱拌匀。' }
    ]
  },
  {
    id: 'steamed-fish',
    name: '清蒸多宝鱼',
    calories: 180,
    trafficLight: 'green',
    type: 'meat',
    seasons: ['spring', 'summer', 'autumn'],
    dateTags: ['weekday', 'weekend'],
    description: '清蒸保留原汁原味，肉质细嫩。',
    nutrients: ['蛋白质', 'DHA'],
    ingredients: ['多宝鱼', '姜丝', '葱段', '蒸鱼豉油'],
    cookingMethod: '大火蒸熟后淋热油提香。',
    bestTime: '家庭晚餐',
    cookingSteps: [
      { title: '鱼身划花', duration: '3分钟', detail: '鱼身两侧轻轻划刀，铺姜葱腌 10 分钟。' },
      { title: '旺火蒸制', duration: '8分钟', detail: '蒸锅水沸后入锅蒸 8 分钟。' },
      { title: '淋油上桌', duration: '2分钟', detail: '倒去蒸汁，淋入热油和蒸鱼豉油。' }
    ]
  },
  {
    id: 'sour-cabbage',
    name: '酸菜牛肉锅',
    calories: 330,
    trafficLight: 'red',
    type: 'meat',
    seasons: ['winter', 'autumn'],
    dateTags: ['weekend', 'festival'],
    description: '酸香汤底搭配肥牛，适合多人分享。',
    nutrients: ['蛋白质', '维生素C'],
    ingredients: ['酸菜', '肥牛卷', '粉丝', '金针菇'],
    cookingMethod: '酸菜爆香后加入汤底，涮煮牛肉与蔬菜。',
    bestTime: '聚餐',
    cookingSteps: [
      { title: '爆香酸菜', duration: '4分钟', detail: '酸菜切段与蒜末一起煸香。' },
      { title: '熬制汤底', duration: '10分钟', detail: '倒入高汤与调料煮沸后小火滚煮。' },
      { title: '即涮即食', duration: '10分钟', detail: '肥牛卷入锅涮 20 秒即食，蔬菜按喜好煮。' }
    ]
  },
  {
    id: 'tofu-pot',
    name: '番茄菌菇豆腐煲',
    calories: 180,
    trafficLight: 'green',
    type: 'vegetarian',
    seasons: ['autumn', 'winter', 'spring'],
    dateTags: ['weekday', 'weekend'],
    description: '富含植物蛋白与纤维，酸甜暖胃。',
    nutrients: ['蛋白质', '钾'],
    ingredients: ['番茄', '嫩豆腐', '杏鲍菇', '香菜'],
    cookingMethod: '番茄煮出汤底后放豆腐小火煨煮。',
    bestTime: '暖胃宵夜',
    cookingSteps: [
      { title: '番茄炒汁', duration: '3分钟', detail: '番茄丁入锅炒软出汁。' },
      { title: '加入食材', duration: '5分钟', detail: '放入菌菇煸香，再倒入高汤与豆腐。' },
      { title: '小火煨煮', duration: '8分钟', detail: '小火煨 8 分钟，撒香菜出锅。' }
    ]
  },
  {
    id: 'cumin-cauliflower',
    name: '孜然花菜',
    calories: 120,
    trafficLight: 'green',
    type: 'vegetarian',
    seasons: ['spring', 'autumn'],
    dateTags: ['weekday', 'weekend'],
    description: '低碳水菜肴，孜然香气浓郁。',
    nutrients: ['维生素C', '叶酸'],
    ingredients: ['花椰菜', '孜然粒', '蒜片', '小红椒'],
    cookingMethod: '先焯后炒保证口感脆嫩。',
    bestTime: '配菜/便当',
    cookingSteps: [
      { title: '花菜焯水', duration: '3分钟', detail: '花菜掰小朵，沸水焯 1 分钟。' },
      { title: '调味炒香', duration: '4分钟', detail: '锅中放油，下蒜片、孜然与红椒爆香。' },
      { title: '快速翻炒', duration: '2分钟', detail: '放入花菜大火快炒，调味后出锅。' }
    ]
  },
  {
    id: 'sweet-potato-bake',
    name: '迷迭香烤红薯',
    calories: 160,
    trafficLight: 'green',
    type: 'vegetarian',
    seasons: ['autumn', 'winter'],
    dateTags: ['weekday', 'weekend'],
    description: '香草烤红薯是补能加餐的健康选择。',
    nutrients: ['膳食纤维', '钾'],
    ingredients: ['红薯', '橄榄油', '迷迭香'],
    cookingMethod: '烤箱低温慢烤，外焦里绵。',
    bestTime: '下午茶/加餐',
    cookingSteps: [
      { title: '切条腌味', duration: '5分钟', detail: '红薯切条拌油与迷迭香。' },
      { title: '入烤箱', duration: '25分钟', detail: '200℃ 烤 20-25 分钟中途翻面。' },
      { title: '稍凉即食', duration: '5分钟', detail: '出炉冷却 5 分钟，风味最佳。' }
    ]
  },
  {
    id: 'lotus-rib-soup',
    name: '莲藕排骨汤',
    calories: 240,
    trafficLight: 'yellow',
    type: 'meat',
    seasons: ['autumn', 'winter'],
    dateTags: ['weekday', 'weekend'],
    description: '汤鲜肉嫩，滋补润燥。',
    nutrients: ['蛋白质', '钙'],
    ingredients: ['猪排骨', '莲藕', '枸杞', '姜片'],
    cookingMethod: '慢火炖煮释出骨胶原与藕香。',
    bestTime: '家庭午餐',
    cookingSteps: [
      { title: '焯排骨', duration: '6分钟', detail: '排骨焯水去腥。' },
      { title: '加入莲藕', duration: '60分钟', detail: '排骨加水炖 30 分钟后放藕片继续煮。' },
      { title: '放枸杞', duration: '5分钟', detail: '加入枸杞再炖 5 分钟，调盐。' }
    ]
  },
  {
    id: 'mixed-grain-congee',
    name: '八宝杂粮粥',
    calories: 210,
    trafficLight: 'yellow',
    type: 'vegetarian',
    seasons: ['winter', 'spring'],
    dateTags: ['weekday', 'weekend', 'festival'],
    description: '多谷物组合，饱腹又暖胃。',
    nutrients: ['膳食纤维', '植物蛋白'],
    ingredients: ['红豆', '绿豆', '薏米', '黑米', '花生', '红枣'],
    cookingMethod: '多种谷物浸泡后慢熬成糯粥。',
    bestTime: '早餐/宵夜',
    cookingSteps: [
      { title: '提前浸泡', duration: '4Сʱ', detail: '所有杂粮提前泡水 4 小时。' },
      { title: '大火煮沸', duration: '10分钟', detail: '加入足量清水大火煮开。' },
      { title: '小火慢熬', duration: '40分钟', detail: '改小火熬至粥体浓稠，适量加糖。' }
    ]
  },
  {
    id: 'kung-pao-chicken',
    name: '宫保鸡丁',
    calories: 260,
    trafficLight: 'yellow',
    type: 'meat',
    seasons: ['spring', 'summer', 'autumn', 'winter'],
    dateTags: ['weekday', 'weekend'],
    description: '酸甜微辣配花生，是下饭神器。',
    nutrients: ['蛋白质', '维生素B6'],
    ingredients: ['鸡腿肉', '花生米', '干辣椒', '花椒'],
    cookingMethod: '鸡丁滑油锁汁，与花生辣椒快炒。',
    bestTime: '工作日晚餐',
    cookingSteps: [
      { title: '腌制鸡丁', duration: '15分钟', detail: '鸡腿肉切丁加淀粉、酱油腌制。' },
      { title: '滑油定型', duration: '2分钟', detail: '鸡丁入热油快速滑散捞出。' },
      { title: '调味快炒', duration: '3分钟', detail: '锅中炒香干辣椒花椒，倒入鸡丁与花生，翻炒裹汁。' }
    ]
  },
  {
    id: 'spinach-tofu-soup',
    name: '菠菜豆腐汤',
    calories: 120,
    trafficLight: 'green',
    type: 'vegetarian',
    seasons: ['spring', 'winter'],
    dateTags: ['weekday', 'weekend'],
    description: '清淡高钙汤品，适合轻食日。',
    nutrients: ['钙', '叶酸'],
    ingredients: ['菠菜', '嫩豆腐', '枸杞', '姜片'],
    cookingMethod: '短时间煮制保持菠菜翠绿。',
    bestTime: '晚餐配汤',
    cookingSteps: [
      { title: '焯菠菜', duration: '1分钟', detail: '菠菜焯水去涩备用。' },
      { title: '煮豆腐', duration: '4分钟', detail: '嫩豆腐切块与姜片同煮。' },
      { title: '加入菠菜', duration: '1分钟', detail: '最后加入菠菜和枸杞，调味即饮。' }
    ]
  },
  {
    id: 'yuxiang-eggplant',
    name: '鱼香茄子',
    calories: 280,
    trafficLight: 'yellow',
    type: 'vegetarian',
    seasons: ['summer', 'autumn'],
    dateTags: ['weekday', 'weekend'],
    description: '酸甜咸辣兼备的下饭菜，可选素版。',
    nutrients: ['膳食纤维', '钾'],
    ingredients: ['茄子', '豆瓣酱', '蒜姜末', '泡椒'],
    cookingMethod: '茄子先炸后烧入味，外嫩里香。',
    bestTime: '午餐/晚餐',
    cookingSteps: [
      { title: '茄子定型', duration: '4分钟', detail: '茄条炸至表面金黄或气炸。' },
      { title: '炒制鱼香汁', duration: '3分钟', detail: '蒜姜末、泡椒、豆瓣炒出香味，加入调味汁。' },
      { title: '合烧收汁', duration: '3分钟', detail: '下茄子翻炒收汁，撒葱花。' }
    ]
  },
  {
    id: 'soba-bowl',
    name: '山药荞麦冷面',
    calories: 230,
    trafficLight: 'green',
    type: 'vegetarian',
    seasons: ['summer'],
    dateTags: ['weekday', 'weekend'],
    description: '日式风味冷面，兼具饱腹与清爽。',
    nutrients: ['复合碳水', '膳食纤维'],
    ingredients: ['荞麦面', '山药泥', '海苔丝', '高汤酱油'],
    cookingMethod: '面条冷却后搭配山药泥，蘸汁食用。',
    bestTime: '夏季午餐',
    cookingSteps: [
      { title: '煮荞麦面', duration: '6分钟', detail: '面条煮熟后冰水降温。' },
      { title: '制作山药泥', duration: '4分钟', detail: '山药去皮擦泥，加入少许柠檬汁防氧化。' },
      { title: '搭配蘸汁', duration: '2分钟', detail: '碗中放面与山药泥，蘸冰镇高汤酱油。' }
    ]
  },
  {
    id: 'curry-potato',
    name: '椰奶咖喱土豆鸡',
    calories: 300,
    trafficLight: 'yellow',
    type: 'meat',
    seasons: ['autumn', 'winter'],
    dateTags: ['weekday', 'weekend'],
    description: '椰香浓郁，土豆吸收咖喱汤汁，非常下饭。',
    nutrients: ['蛋白质', '钾'],
    ingredients: ['鸡腿肉', '土豆', '咖喱块', '椰奶'],
    cookingMethod: '鸡腿先煎封，慢炖入味。',
    bestTime: '周末晚餐',
    cookingSteps: [
      { title: '煎鸡腿块', duration: '5分钟', detail: '鸡腿肉切块煎至表面金黄。' },
      { title: '炖煮入味', duration: '20分钟', detail: '加入土豆、咖喱块和水炖煮。' },
      { title: '加入椰奶', duration: '3分钟', detail: '倒入椰奶再煮 3 分钟，调味即可。' }
    ]
  },
  {
    id: 'pepper-beef',
    name: '黑椒牛柳',
    calories: 245,
    trafficLight: 'yellow',
    type: 'meat',
    seasons: ['spring', 'autumn', 'winter'],
    dateTags: ['weekday', 'weekend'],
    description: '牛柳滑嫩、黑椒香气足，适合搭配米饭或意面。',
    nutrients: ['蛋白质', '铁'],
    ingredients: ['牛里脊', '彩椒', '洋葱', '黑胡椒碎'],
    cookingMethod: '先把牛柳滑炒至变色，再与彩椒洋葱快速翻炒裹汁。',
    bestTime: '午餐/晚餐',
    cookingSteps: [
      { title: '腌制牛柳', duration: '12分钟', detail: '牛柳切条后加入生抽、淀粉和黑胡椒抓匀静置。' },
      { title: '滑炒定型', duration: '3分钟', detail: '热锅快炒牛柳至表面变色后先盛出。' },
      { title: '合炒收汁', duration: '4分钟', detail: '彩椒洋葱炒香后倒回牛柳，淋酱汁翻炒均匀。' }
    ]
  },
  {
    id: 'broccoli-shrimp',
    name: '西兰花虾仁',
    calories: 165,
    trafficLight: 'green',
    type: 'meat',
    seasons: ['spring', 'summer', 'autumn'],
    dateTags: ['weekday', 'weekend'],
    description: '高蛋白低脂组合，颜色清爽，也很适合减脂餐。',
    nutrients: ['蛋白质', '叶酸'],
    ingredients: ['西兰花', '虾仁', '蒜末', '胡萝卜片'],
    cookingMethod: '西兰花焯水后与虾仁快炒，保持鲜嫩口感。',
    bestTime: '健身晚餐',
    cookingSteps: [
      { title: '焯水预处理', duration: '3分钟', detail: '西兰花和胡萝卜片焯水后捞出备用。' },
      { title: '炒香虾仁', duration: '3分钟', detail: '蒜末爆香，下虾仁翻炒至卷曲变色。' },
      { title: '合炒调味', duration: '2分钟', detail: '倒入西兰花和胡萝卜片，调盐快速翻匀。' }
    ]
  },
  {
    id: 'corn-ribs',
    name: '玉米排骨煲',
    calories: 255,
    trafficLight: 'yellow',
    type: 'meat',
    seasons: ['summer', 'autumn', 'winter'],
    dateTags: ['weekday', 'weekend'],
    description: '玉米清甜、排骨鲜香，是很稳妥的家常汤煲。',
    nutrients: ['蛋白质', '钾'],
    ingredients: ['排骨', '玉米段', '胡萝卜', '姜片'],
    cookingMethod: '排骨先焯水，再与玉米胡萝卜慢炖出清甜汤底。',
    bestTime: '家庭午餐',
    cookingSteps: [
      { title: '排骨焯水', duration: '6分钟', detail: '排骨冷水下锅焯出浮沫，冲净备用。' },
      { title: '炖煮汤底', duration: '45分钟', detail: '排骨、姜片和足量清水一起小火慢炖。' },
      { title: '加入蔬菜', duration: '20分钟', detail: '放入玉米段和胡萝卜继续炖至软甜。' }
    ]
  },
  {
    id: 'tofu-skin-salad',
    name: '凉拌豆皮黄瓜',
    calories: 118,
    trafficLight: 'green',
    type: 'vegetarian',
    seasons: ['spring', 'summer'],
    dateTags: ['weekday', 'weekend'],
    description: '豆皮与黄瓜都很清爽，适合作为夏季快手凉菜。',
    nutrients: ['植物蛋白', '维生素E'],
    ingredients: ['豆皮', '黄瓜', '蒜末', '香醋', '辣椒油'],
    cookingMethod: '豆皮焯水后与黄瓜丝拌匀，最后淋入蒜香料汁。',
    bestTime: '夏日配菜',
    cookingSteps: [
      { title: '豆皮焯熟', duration: '2分钟', detail: '豆皮切丝后焯水 30 秒，捞出沥干。' },
      { title: '准备配菜', duration: '3分钟', detail: '黄瓜切丝，蒜末与香醋、生抽、辣椒油调匀。' },
      { title: '拌匀冷藏', duration: '5分钟', detail: '全部食材拌匀后冷藏片刻再食用更爽口。' }
    ]
  },
  {
    id: 'pumpkin-coconut-soup',
    name: '南瓜椰香浓汤',
    calories: 145,
    trafficLight: 'green',
    type: 'vegetarian',
    seasons: ['autumn', 'winter'],
    dateTags: ['weekday', 'weekend'],
    description: '南瓜香甜配椰奶，质地浓稠，适合冷天暖胃。',
    nutrients: ['β-胡萝卜素', '膳食纤维'],
    ingredients: ['南瓜', '洋葱', '椰奶', '黑胡椒'],
    cookingMethod: '先把南瓜煮软打泥，再加入椰奶小火煮成浓汤。',
    bestTime: '下午茶/晚餐配汤',
    cookingSteps: [
      { title: '炒香洋葱', duration: '3分钟', detail: '洋葱碎用黄油或橄榄油炒至半透明。' },
      { title: '煮软南瓜', duration: '12分钟', detail: '加入南瓜块和清水煮至软烂。' },
      { title: '打泥调味', duration: '5分钟', detail: '搅打成泥后加椰奶煮 2 分钟，撒黑胡椒。' }
    ]
  },
  {
    id: 'eggplant-stew',
    name: '番茄土豆炖茄子',
    calories: 185,
    trafficLight: 'green',
    type: 'vegetarian',
    seasons: ['summer', 'autumn'],
    dateTags: ['weekday', 'weekend'],
    description: '家常炖菜，番茄的酸甜能让土豆和茄子更入味。',
    nutrients: ['钾', '膳食纤维'],
    ingredients: ['番茄', '土豆', '茄子', '蒜末'],
    cookingMethod: '番茄炒出汁后，加入土豆和茄子小火焖到软糯。',
    bestTime: '午餐/晚餐',
    cookingSteps: [
      { title: '炒番茄底', duration: '4分钟', detail: '番茄块与蒜末一起炒出浓稠汤汁。' },
      { title: '加入主料', duration: '5分钟', detail: '放入土豆块和茄子块翻炒均匀。' },
      { title: '焖煮收汁', duration: '12分钟', detail: '加少量清水盖盖焖煮至软糯，再开盖收汁。' }
    ]
  },
  {
    id: 'winter-melon-meatball-soup',
    name: '冬瓜丸子汤',
    calories: 135,
    trafficLight: 'green',
    type: 'meat',
    seasons: ['summer', 'autumn'],
    dateTags: ['weekday', 'weekend'],
    description: '汤清味鲜，冬瓜清爽，适合想吃得轻一点的时候。',
    nutrients: ['蛋白质', '钾'],
    ingredients: ['冬瓜', '猪肉丸', '姜丝', '葱花'],
    cookingMethod: '先煮汤底，再下丸子和冬瓜，小火煮到冬瓜透明。',
    bestTime: '晚餐配汤',
    cookingSteps: [
      { title: '煮开汤底', duration: '5分钟', detail: '锅中加水和姜丝，先煮开。' },
      { title: '下肉丸', duration: '4分钟', detail: '放入猪肉丸煮至浮起。' },
      { title: '加入冬瓜', duration: '6分钟', detail: '放入冬瓜片，小火煮到半透明后调味出锅。' }
    ]
  },
  {
    id: 'seaweed-egg-soup',
    name: '紫菜蛋花汤',
    calories: 90,
    trafficLight: 'green',
    type: 'vegetarian',
    seasons: ['spring', 'summer', 'autumn', 'winter'],
    dateTags: ['weekday', 'weekend'],
    description: '快手家常汤，清淡顺口，也很适合做工作日晚餐。',
    nutrients: ['碘', '蛋白质'],
    ingredients: ['紫菜', '鸡蛋', 'ϺƤ', '香油'],
    cookingMethod: '汤底烧开后淋入蛋液，加入紫菜和虾皮即可。',
    bestTime: '工作日晚餐',
    cookingSteps: [
      { title: '准备汤底', duration: '3分钟', detail: '锅中加水和少许虾皮烧开。' },
      { title: '淋入蛋液', duration: '1分钟', detail: '沿锅边缓慢倒入蛋液，形成蛋花。' },
      { title: '加入紫菜', duration: '1分钟', detail: '放入紫菜、盐和香油，稍微滚开即可。' }
    ]
  },
  {
    id: 'tomato-beef-soup',
    name: '番茄牛肉汤',
    calories: 185,
    trafficLight: 'yellow',
    type: 'meat',
    seasons: ['autumn', 'winter', 'spring'],
    dateTags: ['weekday', 'weekend'],
    description: '番茄酸甜开胃，牛肉鲜香，适合做一锅式暖胃汤。',
    nutrients: ['蛋白质', '番茄红素'],
    ingredients: ['番茄', '牛肉片', '洋葱', '黑胡椒'],
    cookingMethod: '番茄炒出汁后加水煮成汤底，再下牛肉片汆熟。',
    bestTime: '午餐/晚餐',
    cookingSteps: [
      { title: '炒香番茄', duration: '4分钟', detail: '番茄和洋葱下锅炒软，炒出汤汁。' },
      { title: '煮汤底', duration: '8分钟', detail: '加入热水煮开，调入盐和黑胡椒。' },
      { title: '汆熟牛肉', duration: '2分钟', detail: '放入牛肉片煮到变色即可关火。' }
    ]
  },
  {
    id: 'miso-tofu-soup',
    name: '味噌豆腐汤',
    calories: 110,
    trafficLight: 'green',
    type: 'vegetarian',
    seasons: ['spring', 'autumn', 'winter'],
    dateTags: ['weekday', 'weekend'],
    description: '偏日式风味的轻汤，豆腐柔软，适合清爽的一餐。',
    nutrients: ['植物蛋白', '钙'],
    ingredients: ['味噌', '嫩豆腐', '海带芽', '葱花'],
    cookingMethod: '先煮海带芽和豆腐，再关小火化开味噌，避免久煮。',
    bestTime: '轻食晚餐',
    cookingSteps: [
      { title: '煮开清汤', duration: '4分钟', detail: '锅中加水煮开，放入海带芽。' },
      { title: '加入豆腐', duration: '3分钟', detail: '放入嫩豆腐块，小火保持微沸。' },
      { title: '化开味噌', duration: '2分钟', detail: '舀出少量热汤化开味噌后回锅，撒葱花即可。' }
    ]
  }
];


module.exports = { FOODS };
