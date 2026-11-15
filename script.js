
/* ==========================================
   WELLNEST - FRONTEND CONFIGURATION
========================================== */

// 1. PASTE YOUR FASTAPI BACKEND URL HERE

const API_URL = "https://wellnest-backend-6ra1.onrender.com/";

// Example:
// const API_URL = "https://your-backend.onrender.com/predict";


// 2. CONFIGURE THE MODEL SCORE RANGE
// Change these values according to your model's
// actual prediction range.

const SCORE_MIN = 0;
const SCORE_MAX = 10;


/* ==========================================
   DOM ELEMENTS
========================================== */

const form = document.getElementById("assessmentForm");

const submitButton = document.getElementById("submitButton");

const resetButton = document.getElementById("resetButton");

const toast = document.getElementById("toast");

const toastMessage = document.getElementById("toastMessage");

const scoreNumber = document.getElementById("scoreNumber");

const scoreStatus = document.getElementById("scoreStatus");

const scoreDescription = document.getElementById("scoreDescription");

const gaugeProgress = document.getElementById("gaugeProgress");

const wavePath = document.getElementById("wavePath");

const scoreContainer = document.getElementById("scoreContainer");

let toastTimer;


/* ==========================================
   LUCIDE ICON INITIALIZATION
========================================== */

function initializeIcons() {
    if (window.lucide) {
        lucide.createIcons();
    }
}

initializeIcons();


/* ==========================================
   SLIDER FUNCTIONALITY
========================================== */

const sliderIds = [
    "avg_daily_usage_hours",
    "daily_unlocks",
    "study_hours",
    "physical_activity_hours",
    "sleep_hours_per_night"
];

function updateSlider(slider) {

    const value = slider.value;

    const min = Number(slider.min);

    const max = Number(slider.max);

    const percentage = ((value - min) / (max - min)) * 100;

    const output = document.getElementById(
        slider.id + "_value"
    );

    output.textContent = Number(value).toLocaleString(
        "en-US",
        { maximumFractionDigits: 1 }
    );

    // Solid slider track with a separate progress indicator
    slider.style.background = `linear-gradient(
        to right,
        var(--sage) ${percentage}%,
        #E9EDE7 ${percentage}%
    )`;
}

sliderIds.forEach(id => {

    const slider = document.getElementById(id);

    slider.addEventListener("input", () => {
        updateSlider(slider);
    });

    updateSlider(slider);
});


/* ==========================================
   TOAST NOTIFICATIONS
========================================== */

function showToast(message) {

    toastMessage.textContent = message;

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {

        toast.classList.remove("show");

    }, 3500);
}


/* ==========================================
   VALIDATION
========================================== */

function validateForm() {

    const age = Number(
        document.getElementById("age").value
    );

    if (!Number.isInteger(age) || age < 10 || age > 100) {

        showToast("Age must be between 10 and 100.");

        return false;
    }

    const hoursFields = [
        "avg_daily_usage_hours",
        "study_hours",
        "physical_activity_hours",
        "sleep_hours_per_night"
    ];

    for (const id of hoursFields) {

        const value = Number(
            document.getElementById(id).value
        );

        if (!Number.isFinite(value) || value < 0 || value > 24) {

            showToast("Hours must be between 0 and 24.");

            return false;
        }
    }

    const unlocks = Number(
        document.getElementById("daily_unlocks").value
    );

    if (!Number.isInteger(unlocks) || unlocks < 0) {

        showToast("Enter a valid number of phone unlocks.");

        return false;
    }

    return true;
}


/* ==========================================
   COLLECT FORM DATA
========================================== */

function getFormData() {

    return {

        age: Number(
            document.getElementById("age").value
        ),

        gender:
            document.getElementById("gender").value,

        country:
            document.getElementById("country").value,

        academic_level:
            document.getElementById("academic_level").value,

        most_used_platform:
            document.getElementById("most_used_platform").value,

        purpose_of_use:
            document.getElementById("purpose_of_use").value,

        avg_daily_usage_hours:
            Number(
                document.getElementById("avg_daily_usage_hours").value
            ),

        daily_unlocks:
            Number(
                document.getElementById("daily_unlocks").value
            ),

        study_hours:
            Number(
                document.getElementById("study_hours").value
            ),

        physical_activity_hours:
            Number(
                document.getElementById("physical_activity_hours").value
            ),

        sleep_hours_per_night:
            Number(
                document.getElementById("sleep_hours_per_night").value
            ),

        stress_level:
            document.getElementById("stress_level").value

    };

}


/* ==========================================
   LOADING STATE
========================================== */

function setLoading(isLoading) {

    submitButton.disabled = isLoading;

    if (isLoading) {

        submitButton.innerHTML = `
            <span class="loading-spinner"></span>
            <span>Analysing your responses...</span>
        `;

    } else {

        submitButton.innerHTML = `
            <span>Generate my assessment</span>
            <i data-lucide="arrow-up-right"></i>
        `;

        initializeIcons();
    }

}


/* ==========================================
   API REQUEST
========================================== */

async function predictMentalHealth(data) {

    try {

        const response = await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(data)

        });


        // Handle unsuccessful HTTP responses

        if (!response.ok) {

            let errorMessage = "Unable to generate prediction.";

            try {

                const errorData = await response.json();

                if (Array.isArray(errorData.detail)) {

                    errorMessage = errorData.detail
                        .map(error => error.msg)
                        .join(", ");

                } else if (typeof errorData.detail === "string") {

                    errorMessage = errorData.detail;

                }

            } catch (error) {
                // Keep the default message.
            }

            throw new Error(errorMessage);

        }


        const result = await response.json();


        if (
            typeof result.predicted_mental_health_score !== "number" ||
            !Number.isFinite(result.predicted_mental_health_score)
        ) {

            throw new Error("Invalid prediction returned by the server.");

        }

        return result.predicted_mental_health_score;

    } catch (error) {

        console.error("Prediction API error:", error);

        throw error;

    }

}


/* ==========================================
   SCORE CLASSIFICATION
========================================== */

// These descriptions are illustrative.
// Confirm the meaning and direction of your model's
// score before using them as actual interpretations.

function getScoreInformation(score) {

    const range = SCORE_MAX - SCORE_MIN;

    const normalized = ((score - SCORE_MIN) / range) * 100;

    if (normalized >= 75) {

        return {
            status: "Higher score",
            description: "Your model returned a value toward the upper end of its prediction range."
        };

    }

    if (normalized >= 50) {

        return {
            status: "Above midpoint",
            description: "Your predicted value is above the midpoint of the configured model range."
        };

    }

    if (normalized >= 25) {

        return {
            status: "Below midpoint",
            description: "Your predicted value is below the midpoint of the configured model range."
        };

    }

    return {
        status: "Lower score",
        description: "Your model returned a value toward the lower end of its prediction range."
    };

}


/* ==========================================
   WAVY SEMICIRCLE GAUGE
========================================== */

function animateScore(score) {

    // Normalize the score to the configured range

    const normalized = Math.max(
        0,
        Math.min(
            1,
            (score - SCORE_MIN) / (SCORE_MAX - SCORE_MIN)
        )
    );


    // Semicircle arc length

    const circumference = 471.24;


    // Animate circular progress

    const offset = circumference * (1 - normalized);

    gaugeProgress.style.strokeDashoffset = offset;


    // Animate wave level.
    // The water level rises as the score increases.

    const waveOffset = 140 * (1 - normalized);

    wavePath.style.transform = `translateY(${waveOffset}px)`;


    // Update number

    scoreNumber.textContent = score.toFixed(2);


    // Update status

    const info = getScoreInformation(score);

    scoreStatus.textContent = info.status;

    scoreDescription.textContent = info.description;


    // Update result panel

    scoreContainer.classList.add("result-updated");

}


/* ==========================================
   FORM SUBMISSION
========================================== */

form.addEventListener("submit", async (event) => {

    event.preventDefault();

    if (!validateForm()) {
        return;
    }

    const data = getFormData();

    console.log("Sending data to backend:", data);

    setLoading(true);

    try {

        // Call FastAPI

        const prediction = await predictMentalHealth(data);


        // Animate returned prediction

        animateScore(prediction);

        showToast("Your prediction has been generated.");


        // Scroll to result on mobile

        if (window.innerWidth <= 760) {

            document.getElementById("resultPanel").scrollIntoView({

                behavior: "smooth",

                block: "start"

            });

        }

        console.log("Predicted score:", prediction);

    } catch (error) {

        showToast(error.message || "Something went wrong.");

    } finally {

        setLoading(false);

    }

});


/* ==========================================
   RESET FUNCTIONALITY
========================================== */

resetButton.addEventListener("click", () => {

    form.reset();


    // Refresh slider values

    sliderIds.forEach(id => {

        const slider = document.getElementById(id);

        updateSlider(slider);

    });


    // Reset gauge

    gaugeProgress.style.strokeDashoffset = 471.24;

    wavePath.style.transform = "translateY(140px)";


    // Reset score

    scoreNumber.textContent = "--";

    scoreStatus.textContent = "Awaiting assessment";

    scoreDescription.textContent =
        "Complete the assessment to see your predicted score.";


    scoreContainer.classList.remove("result-updated");


    showToast("Assessment has been reset.");

});


/* ==========================================
   INITIAL GAUGE STATE
========================================== */

gaugeProgress.style.strokeDasharray = 471.24;

gaugeProgress.style.strokeDashoffset = 471.24;

wavePath.style.transform = "translateY(140px)";
