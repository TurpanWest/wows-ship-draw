const DEFAULT_SHIPS = [
  { name: "岛风", type: "DD" },
  { name: "春云", type: "DD" },
  { name: "疾风", type: "DD" },
  { name: "大和", type: "BB" },
  { name: "敷岛", type: "BB" },
  { name: "丰后", type: "BB" },
  { name: "吉野", type: "CA" },
  { name: "北上", type: "CA" },
  { name: "藏王", type: "CA" },
  { name: "淀", type: "CA" },
  { name: "白龙", type: "CV" },
  { name: "信浓", type: "CV" },
  { name: "蒙大拿", type: "BB" },
  { name: "佛蒙特", type: "BB" },
  { name: "路易斯安那", type: "BB" },
  { name: "威斯康星", type: "BB" },
  { name: "罗德岛", type: "BB" },
  { name: "俄亥俄", type: "BB" },
  { name: "俄勒冈", type: "BB" },
  { name: "得梅因", type: "CA" },
  { name: "伍斯特", type: "CA" },
  { name: "塞勒姆", type: "CA" },
  { name: "奥斯汀", type: "CA" },
  { name: "波多黎各", type: "CA" },
  { name: "基林", type: "DD" },
  { name: "赫尔", type: "DD" },
  { name: "福雷斯特·谢尔曼", type: "DD" },
  { name: "萨默斯", type: "DD" },
  { name: "中途岛", type: "CV" },
  { name: "埃塞克斯", type: "CV" },
  { name: "富兰克林·罗斯福", type: "CV" },
  { name: "巴劳鱵", type: "SS" },
  { name: "猫鲨", type: "SS" },
  { name: "射水鱼", type: "SS" },
  { name: "米诺陶", type: "CA" },
  { name: "果敢", type: "DD" },
  { name: "圣文森特", type: "BB" },
  { name: "征服者", type: "BB" },
  { name: "连枷", type: "SS" },
  { name: "无比", type: "BB" },
  { name: "普利茅斯", type: "CA" },
  { name: "德鲁伊", type: "DD" },
  { name: "大胆", type: "CV" },
  { name: "蒙茅斯", type: "CA" },
  { name: "防卫", type: "CA" },
  { name: "马耳他", type: "CV" },
  { name: "哥利亚", type: "CA" },
  { name: "雷神", type: "BB" },
  { name: "海豹", type: "SS" },
  { name: "直布罗陀", type: "CA" },
  { name: "彼得罗巴甫洛夫斯克", type: "CA" },
  { name: "K-1", type: "SS" },
  { name: "哈巴罗夫斯克", type: "DD" },
  { name: "斯大林格勒", type: "CA" },
  { name: "塞瓦斯托波尔", type: "CA" },
  { name: "莫斯科", type: "CA" },
  { name: "雷暴", type: "DD" },
  { name: "光荣", type: "BB" },
  { name: "克里姆林", type: "BB" },
  { name: "科米萨尔", type: "CA" },
  { name: "德尔尼", type: "DD" },
  { name: "纳希莫夫", type: "CV" },
  { name: "亚历山大·涅夫斯基", type: "CA" },
  { name: "斯摩棱斯克", type: "CA" },
  { name: "兴登堡", type: "CA" },
  { name: "大选帝侯", type: "BB" },
  { name: "U-4501", type: "SS" },
  { name: "埃尔宾", type: "DD" },
  { name: "Z-42", type: "DD" },
  { name: "施里芬", type: "BB" },
  { name: "U-2501", type: "SS" },
  { name: "希尔德布兰德", type: "CA" },
  { name: "M.里希特霍芬", type: "CV" },
  { name: "Z-52", type: "DD" },
  { name: "格奥尔格·霍夫曼", type: "DD" },
  { name: "梅克伦堡", type: "BB" },
  { name: "马克斯·股麦曼", type: "CV" },
  { name: "普鲁士", type: "BB" },
  { name: "共和国", type: "BB" },
  { name: "卡萨尔", type: "DD" },
  { name: "马赛", type: "CA" },
  { name: "科尔伯特", type: "CA" },
  { name: "克莱贝尔", type: "DD" },
  { name: "勃艮第", type: "BB" },
  { name: "布伦努斯", type: "CA" },
  { name: "亨利四世", type: "CA" },
  { name: "玛索", type: "DD" },
  { name: "斯维亚", type: "CA" },
  { name: "斯莫兰", type: "DD" },
  { name: "格但斯克", type: "DD" },
  { name: "朗纳尔", type: "DD" },
  { name: "哈兰", type: "DD" },
  { name: "阿蒂略·莱戈洛", type: "DD" },
  { name: "威尼斯", type: "CA" },
  { name: "阿尔贝里科·达·巴尔比亚诺", type: "DD" },
  { name: "鲁杰罗·迪·劳里亚", type: "BB" },
  { name: "克里斯托弗·哥伦布", type: "BB" },
  { name: "那不勒斯", type: "CA" },
  { name: "吸血鬼II", type: "DD" },
  { name: "刻耳柏洛斯", type: "CA" },
  { name: "西西里", type: "BB" },
  { name: "布里斯班", type: "CA" },
  { name: "金狮", type: "CA" },
  { name: "岳阳", type: "DD" },
  { name: "特龙普", type: "DD" },
  { name: "济南", type: "CA" },
  { name: "奥兰治亲王", type: "CA" },
  { name: "拉潘帕", type: "DD" },
  { name: "圣马丁", type: "CA" },
  { name: "阿尔瓦罗·德·巴赞", type: "DD" },
  { name: "仁川", type: "CA" },
  { name: "旅顺", type: "DD" },
  { name: "自由", type: "DD" },
  { name: "乌特勒支", type: "CA" },
  { name: "卡斯蒂利亚", type: "CA" },
  { name: "威廉一世", type: "BB" },
  { name: "无阻", type: "BB" }
];
