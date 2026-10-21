const { Client } = require('@notionhq/client');

module.exports = async (req, res) => {
  try {
    const token = process.env.NOTION_TOKEN;
    const dbId = process.env.PRODUCT_DB_ID;

    // 檢查環境變數
    if (!token || !dbId) {
      return res.status(200).json({
        status: "Error",
        message: "環境變數缺少！",
        hasToken: !!token,
        hasProductDbId: !!dbId
      });
    }

    const notion = new Client({ auth: token });
    
    // 查詢 Notion A 資料庫
    const response = await notion.databases.query({
      database_id: dbId,
    });

    // 將 Notion 回傳的原始欄位結構印出來
    const debugInfo = response.results.map(page => ({
      pageId: page.id,
      propertyKeys: Object.keys(page.properties), // 資料庫裡的所有欄位名稱
      propertiesRaw: page.properties              // 原始屬性資料
    }));

    res.status(200).json({
      status: "Success",
      totalCount: response.results.length, // 抓到的筆數
      data: debugInfo
    });

  } catch (error) {
    res.status(500).json({
      status: "API Error",
      errorMessage: error.message
    });
  }
};
