/* =========================================
   SHAYDA HR
   Frontend Application
   Version 1.0
========================================= */


const API_URL = "https://shayda-ikk.liara.run/api/analyze";


const jobTitleInput = document.getElementById("jobTitle");
const jobLevelInput = document.getElementById("jobLevel");
const jobDescriptionInput = document.getElementById("jobDescription");


const analyzeBtn = document.getElementById("analyzeBtn");


const loadingBox = document.getElementById("loading");
const errorBox = document.getElementById("errorMessage");


const resultsSection = document.getElementById("resultsSection");


const jobSummaryBox = document.getElementById("jobSummary");
const competenciesBox = document.getElementById("competencies");
const riskResultBox = document.getElementById("riskResult");
const developmentPathBox = document.getElementById("developmentPath");



/* =========================================
   INITIAL STATE
========================================= */


document.addEventListener("DOMContentLoaded", () => {


  hideLoading();
  hideError();


});



/* =========================================
   ANALYZE BUTTON
========================================= */


analyzeBtn.addEventListener("click", analyzeJob);



/* =========================================
   MAIN ANALYSIS FUNCTION
========================================= */


async function analyzeJob() {


  hideError();


  const jobTitle = jobTitleInput.value.trim();
  const jobLevel = jobLevelInput.value;
  const jobDescription = jobDescriptionInput.value.trim();



  /* ---------- Validation ---------- */


  if (!jobTitle) {


    showError("لطفاً عنوان پست را وارد کنید.");


    jobTitleInput.focus();


    return;
  }



  if (!jobLevel) {


    showError("لطفاً سطح پست را انتخاب کنید.");


    jobLevelInput.focus();


    return;
  }



  if (!jobDescription) {


    showError("لطفاً شرح شغل را وارد کنید.");


    jobDescriptionInput.focus();


    return;
  }



  if (jobDescription.length < 30) {


    showError(
      "شرح شغل وارد شده بسیار کوتاه است. لطفاً شرح کامل‌تری وارد کنید."
    );


    jobDescriptionInput.focus();


    return;
  }



  /* ---------- Start Loading ---------- */


  setLoading(true);


  resultsSection.classList.add("hidden");



  try {


    const response = await fetch(API_URL, {


      method: "POST",


      headers: {
        "Content-Type": "application/json"
      },


      body: JSON.stringify({


        jobTitle: jobTitle,


        jobLevel: jobLevel,


        jobDescription: jobDescription


      })


    });



    /* ---------- HTTP Error ---------- */


    if (!response.ok) {


      let errorData = null;


      try {


        errorData = await response.json();


      } catch (error) {


        // پاسخ JSON نبود


      }


      throw new Error(


        errorData?.message ||


        `خطا در ارتباط با سرور. کد خطا: ${response.status}`


      );


    }



    /* ---------- Parse Response ---------- */


    const result = await response.json();



    if (!result.success) {


      throw new Error(


        result.message ||


        "تحلیل شغل با موفقیت انجام نشد."


      );


    }



    if (!result.data) {


      throw new Error(
        "نتیجه‌ای از سامانه دریافت نشد."
      );


    }



    /* ---------- Render Results ---------- */


    renderResults(result.data);



    /* ---------- Show Results ---------- */


    resultsSection.classList.remove("hidden");



    setTimeout(() => {


      resultsSection.scrollIntoView({


        behavior: "smooth",


        block: "start"


      });


    }, 100);



  } catch (error) {


    console.error(
      "Shayda HR Analysis Error:",
      error
    );



    showError(


      error.message ||


      "خطایی در ارتباط با سامانه هوشمند رخ داد."


    );


  } finally {


    setLoading(false);


  }


}



/* =========================================
   RENDER ALL RESULTS
========================================= */


function renderResults(data) {


  renderJobSummary(data);


  renderCompetencies(data.competencies);


  renderRisk(data.riskOfNonQualification);


  renderDevelopmentPath(data.developmentPath);


}



/* =========================================
   JOB SUMMARY
========================================= */


function renderJobSummary(data) {


  const title = escapeHTML(
    data.jobTitle || "-"
  );


  const level = escapeHTML(
    data.jobLevel || "-"
  );


  const summary = escapeHTML(
    data.jobSummary || "خلاصه‌ای برای این شغل ارائه نشده است."
  );



  jobSummaryBox.innerHTML = `


    <div class="summary-content">


      <div class="summary-item">


        <strong>عنوان پست</strong>


        <span>${title}</span>


      </div>



      <div class="summary-item">


        <strong>سطح پست</strong>


        <span>${level}</span>


      </div>



      <div class="summary-description">


        <strong>خلاصه تحلیل</strong>


        <p>${summary}</p>


      </div>


    </div>


  `;


}



/* =========================================
   COMPETENCIES
========================================= */


function renderCompetencies(competencies) {


  if (
    !Array.isArray(competencies) ||
    competencies.length === 0
  ) {


    competenciesBox.innerHTML = `


      <div class="empty-result">


        اطلاعات شایستگی‌ها دریافت نشد.


      </div>


    `;


    return;


  }



  competenciesBox.innerHTML = competencies


    .map((competency, index) => {


      const name = escapeHTML(
        competency.name || `شایستگی ${index + 1}`
      );


      const definition = escapeHTML(
        competency.definition || "-"
      );


      const importance = escapeHTML(
        competency.importance || "-"
      );


      const developmentLevel = escapeHTML(
        competency.developmentLevel || "-"
      );



      return `


        <div class="competency-card">


          <div class="competency-number">


            ${index + 1}


          </div>



          <div class="competency-content">


            <h4>
              ${name}
            </h4>



            <p class="competency-definition">


              ${definition}


            </p>



            <div class="competency-meta">



              <div>


                <span>
                  اهمیت
                </span>


                <strong>
                  ${importance}
                </strong>


              </div>



              <div>


                <span>
                  سطح توسعه موردنیاز
                </span>


                <strong>
                  ${developmentLevel}
                </strong>


              </div>



            </div>


          </div>


        </div>


      `;


    })


    .join("");


}



/* =========================================
   RISK OF NON-QUALIFICATION
========================================= */


function renderRisk(risk) {


  if (!risk) {


    riskResultBox.innerHTML = `


      <div class="empty-result">


        اطلاعات ریسک عدم احراز دریافت نشد.


      </div>


    `;


    return;


  }



  const level = escapeHTML(
    risk.level || "-"
  );


  const description = escapeHTML(
    risk.description || "-"
  );



  let consequencesHTML = "";



  if (
    Array.isArray(risk.consequences) &&
    risk.consequences.length > 0
  ) {


    consequencesHTML = `


      <div class="risk-consequences">


        <h4>
          پیامدهای احتمالی
        </h4>


        <ul>


          ${risk.consequences


            .map(
              item => `
                <li>
                  ${escapeHTML(item)}
                </li>
              `
            )


            .join("")}


        </ul>


      </div>


    `;


  }



  riskResultBox.innerHTML = `


    <div class="risk-result">



      <div class="risk-level">


        <span>
          سطح ریسک
        </span>


        <strong>
          ${level}
        </strong>


      </div>



      <div class="risk-description">


        <p>
          ${description}
        </p>


      </div>



      ${consequencesHTML}



    </div>


  `;


}



/* =========================================
   DEVELOPMENT PATH
========================================= */


function renderDevelopmentPath(path) {


  if (
    !Array.isArray(path) ||
    path.length === 0
  ) {


    developmentPathBox.innerHTML = `


      <div class="empty-result">


        مسیر توسعه‌ای دریافت نشد.


      </div>


    `;


    return;


  }



  developmentPathBox.innerHTML = path


    .map((item, index) => {


      const title = escapeHTML(
        item.title || `مرحله ${index + 1}`
      );


      const description = escapeHTML(
        item.description || "-"
      );


      const priority = escapeHTML(
        item.priority || "-"
      );



      return `


        <div class="development-step">



          <div class="development-number">


            ${index + 1}


          </div>



          <div class="development-content">


            <h4>


              ${title}


            </h4>



            <p>


              ${description}


            </p>



            <span class="priority">


              اولویت:
              ${priority}


            </span>


          </div>



        </div>


      `;


    })


    .join("");


}



/* =========================================
   LOADING STATE
========================================= */


function setLoading(isLoading) {


  if (isLoading) {


    analyzeBtn.disabled = true;


    analyzeBtn.textContent =
      "در حال تحلیل اطلاعات...";


    showLoading();


  } else {


    analyzeBtn.disabled = false;


    analyzeBtn.textContent =
      "تحلیل هوشمند شغل";


    hideLoading();


  }


}



/* =========================================
   LOADING HELPERS
========================================= */


function showLoading() {


  loadingBox.classList.remove("hidden");


}



function hideLoading() {


  loadingBox.classList.add("hidden");


}



/* =========================================
   ERROR HELPERS
========================================= */


function showError(message) {


  errorBox.textContent = message;


  errorBox.classList.remove("hidden");


}



function hideError() {


  errorBox.textContent = "";


  errorBox.classList.add("hidden");


}



/* =========================================
   SECURITY
   Prevent HTML Injection
========================================= */


function escapeHTML(value) {


  const div = document.createElement("div");


  div.textContent = String(value);


  return div.innerHTML;


}

