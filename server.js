const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const OpenAI = require("openai");


dotenv.config();


const app = express();


const PORT = process.env.PORT || 3000;


app.use(cors());
app.use(express.json({ limit: "1mb" }));


// اتصال به مدل هوشمند لیارا
const client = new OpenAI({
  apiKey: process.env.LIARA_API_KEY,
  baseURL: "https://ai.liara.ir/api/69947539680d5b217e646865/v1"
});


// تست سلامت سرور
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Shayda HR API is running"
  });
});


// تحلیل شغل
app.post("/api/analyze", async (req, res) => {
  try {
    const {
      jobTitle,
      jobLevel,
      jobDescription
    } = req.body;


    // بررسی اطلاعات ورودی
    if (!jobTitle || !jobLevel || !jobDescription) {
      return res.status(400).json({
        success: false,
        message: "عنوان پست، سطح پست و شرح شغل الزامی است."
      });
    }


    const prompt = `
شما یک سامانه هوشمند تحلیل شایستگی‌های شغلی در حوزه منابع انسانی هستید.


اطلاعات شغل:


عنوان پست:
${jobTitle}


سطح پست:
${jobLevel}


شرح شغل:
${jobDescription}


وظیفه شما این است که اطلاعات بالا را به صورت دقیق و ساختاریافته تحلیل کنید.


لطفاً نتیجه را فقط در قالب JSON معتبر برگردانید.


ساختار خروجی باید دقیقاً شامل موارد زیر باشد:


{
  "jobTitle": "",
  "jobLevel": "",
  "jobSummary": "",
  "competencies": [
    {
      "name": "",
      "definition": "",
      "importance": "",
      "developmentLevel": ""
    }
  ],
  "riskOfNonQualification": {
    "title": "ریسک عدم احراز",
    "level": "",
    "description": "",
    "consequences": []
  },
  "developmentPath": [
    {
      "title": "",
      "description": "",
      "priority": ""
    }
  ],
  "recommendations": []
}


قوانین تحلیل:


1. دقیقاً 10 شایستگی شغلی استخراج کن.
2. برای هر شایستگی حتماً نام و تعریف کامل ارائه کن.
3. اهمیت هر شایستگی را مشخص کن.
4. سطح توسعه موردنیاز هر شایستگی را مشخص کن.
5. ریسک عدم احراز شغل را به صورت جداگانه تحلیل کن.
6. سطح ریسک را یکی از این موارد قرار بده:
   کم، متوسط، زیاد، بحرانی
7. پیامدهای احتمالی عدم احراز شایستگی‌های کلیدی را فهرست کن.
8. یک مسیر توسعه پیشنهادی برای فرد ارائه کن.
9. پیشنهادها باید متناسب با عنوان، سطح و شرح شغل باشند.
10. از ارائه اطلاعات غیرمرتبط با شغل خودداری کن.
11. پاسخ باید کاملاً فارسی باشد.
12. خروجی فقط JSON معتبر باشد و هیچ متن دیگری خارج از JSON قرار نگیرد.
`;


    const completion = await client.chat.completions.create({
      model: "openai/gpt-5.6-sol",
      messages: [
        {
          role: "system",
          content:
            "شما یک متخصص ارشد تحلیل شایستگی‌های شغلی و توسعه منابع انسانی هستید."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3
    });


    const resultText = completion.choices[0]?.message?.content;


    if (!resultText) {
      return res.status(500).json({
        success: false,
        message: "پاسخی از مدل هوشمند دریافت نشد."
      });
    }


    // حذف احتمالی علامت‌های Markdown در پاسخ مدل
    let cleanedResult = resultText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();


    let result;


    try {
      result = JSON.parse(cleanedResult);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      console.error("Model Response:", resultText);


      return res.status(500).json({
        success: false,
        message: "پاسخ مدل قابل پردازش نیست.",
        rawResponse: resultText
      });
    }


    return res.json({
      success: true,
      data: result
    });


  } catch (error) {
    console.error("Analysis Error:", error);


    return res.status(500).json({
      success: false,
      message: "خطایی هنگام تحلیل اطلاعات رخ داد.",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined
    });
  }
});


app.listen(PORT, "0.0.0.0", () => {
  console.log(`Shayda HR API is running on port ${PORT}`);
});

