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

2. شایستگی‌ها را فقط بر اساس عنوان شغل، سطح شغل و شرح شغل تحلیل کن و از ارائه موارد غیرمرتبط با شغل خودداری کن.

3. برای هر شایستگی حتماً اطلاعات زیر را ارائه کن:
   
   - code: کد یکتای شایستگی
   - name: نام شایستگی
   - definition: تعریف کامل و دقیق شایستگی
   - importance: میزان اهمیت شایستگی برای شغل
   - development_level: سطح توسعه موردنیاز شایستگی
   - behavioral_examples: مصادیق رفتاری قابل مشاهده مرتبط با شایستگی

4. برای هر شایستگی حداقل 1 مصداق رفتاری مشخص و قابل مشاهده ارائه کن.

5. در مجموع دقیقاً 10 مصداق رفتاری ارائه کن؛ یعنی برای هر یک از 10 شایستگی دقیقاً یک مصداق رفتاری ارائه شود.

6. مصداق رفتاری باید:
   
   - کاملاً متناسب با عنوان شغل، سطح شغل و شرح شغل باشد.
   - قابل مشاهده و قابل ارزیابی باشد.
   - رفتار واقعی فرد را توصیف کند، نه یک ویژگی شخصیتی یا عبارت کلی.
   - از عبارت‌های مبهم و عمومی مانند «فرد خوبی است»، «مسئولیت‌پذیر است» یا «توانایی بالایی دارد» استفاده نکند.
   - نشان دهد فرد چگونه شایستگی موردنظر را در محیط کار به رفتار تبدیل می‌کند.

7. کد هر شایستگی باید یکتا باشد و فقط برای همان شایستگی استفاده شود.

8. کد شایستگی را بر اساس ترتیب نمایش یا شماره ردیف تولید نکن؛ کد باید به عنوان یک شناسه مستقل در نظر گرفته شود.

9. اهمیت هر شایستگی را متناسب با الزامات واقعی شغل تعیین کن.

10. سطح توسعه موردنیاز هر شایستگی را متناسب با سطح شغل تعیین کن.

11. ریسک عدم احراز شغل را به صورت جداگانه و بر اساس شایستگی‌های کلیدی تحلیل کن.

12. سطح ریسک را فقط یکی از این چهار مقدار قرار بده:
    "کم"
    "متوسط"
    "زیاد"
    "بحرانی"

13. پیامدهای احتمالی عدم احراز شایستگی‌های کلیدی را به صورت فهرست ارائه کن.

14. یک مسیر توسعه پیشنهادی برای فرد ارائه کن که مستقیماً با عنوان شغل، سطح شغل، شرح شغل و شکاف‌های شایستگی مرتبط باشد.

15. مسیر توسعه باید عملی، قابل اجرا و متناسب با شغل باشد و از پیشنهادهای عمومی و غیرمرتبط خودداری شود.

16. تمام محتوای متنی خروجی باید کاملاً فارسی باشد.

17. خروجی باید فقط JSON معتبر باشد و هیچ متن، توضیح، Markdown یا کدی خارج از JSON قرار نگیرد.

18. ساختار JSON خروجی باید دقیقاً مطابق ساختار زیر باشد و هیچ فیلد اضافی خارج از این ساختار ایجاد نشود:

{
"competencies": [
{
"code": "COMP-XXXXXX",
"name": "...",
"definition": "...",
"importance": "...",
"development_level": "...",
"behavioral_example": "..."
}
],
"job_risk": {
"level": "کم",
"analysis": "...",
"consequences": [
"...",
"..."
]
},
"development_path": [
{
"priority": 1,
"competency_code": "COMP-XXXXXX",
"action": "...",
"expected_outcome": "..."
}
]
}

19. آرایه competencies باید دقیقاً شامل 10 مورد باشد.

20. هر یک از 10 شایستگی باید دقیقاً یک behavioral_example داشته باشد؛ بنابراین در مجموع دقیقاً 10 مصداق رفتاری ارائه شود.

21. تمام behavioral_exampleها باید متفاوت، مشخص، قابل مشاهده و متناسب با همان شایستگی باشند.

22. مقدار code برای هر شایستگی باید یکتا باشد و هیچ دو شایستگی نباید code یکسان داشته باشند.

23. در development_path فقط از competency_codeهایی استفاده کن که در آرایه competencies وجود دارند.

24. سطح ریسک job_risk.level باید فقط یکی از مقادیر زیر باشد:
    "کم"
    "متوسط"
    "زیاد"
    "بحرانی"

25. قبل از تولید خروجی، ساختار JSON را بررسی کن و مطمئن شو:

- دقیقاً 10 شایستگی وجود دارد.
- برای هر شایستگی دقیقاً یک مصداق رفتاری وجود دارد.
- در مجموع دقیقاً 10 مصداق رفتاری وجود دارد.
- تمام codeها یکتا هستند.
- تمام competency_codeهای مسیر توسعه معتبر هستند.
- سطح ریسک یکی از چهار مقدار مجاز است.
- تمام محتوای متنی فارسی است.
- JSON کاملاً معتبر است.
- هیچ متن یا توضیحی خارج از JSON وجود ندارد.
`;


    const completion = await client.chat.completions.create({
      model: "openai/gpt-5-nano",
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

