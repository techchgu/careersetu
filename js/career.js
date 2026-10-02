/* =====================================================
   CAREERSETU AI
   CAREER PAGE JAVASCRIPT
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

  console.log("CareerSetu Career Page Loaded");


  /* =====================================================
     ELEMENTS
  ===================================================== */

  const sidebar =
    document.getElementById("sidebar");

  const menuBtn =
    document.getElementById("mobileMenuBtn");

  const overlay =
    document.getElementById("sidebarOverlay");

  const levelFilter =
    document.getElementById("levelFilter");

  const updateBtn =
    document.getElementById("updateCoursesBtn");

  const targetCareer =
    document.getElementById("targetCareer");

  const overviewCareer =
    document.getElementById("overviewCareer");

  const courseCount =
    document.getElementById("courseCount");

  const totalDuration =
    document.getElementById("totalDuration");

  const courseSubtitle =
    document.getElementById("courseSubtitle");

  const careerStatusText =
    document.getElementById("careerStatusText");

  const coursesGrid =
    document.getElementById("coursesGrid");

  const careerAlert =
    document.getElementById("careerAlert");


  /* =====================================================
     MOBILE SIDEBAR
  ===================================================== */

  if (menuBtn && sidebar) {

    menuBtn.addEventListener("click", () => {

      sidebar.classList.toggle("open");

      if (overlay) {
        overlay.classList.toggle("active");
      }

    });

  }


  if (overlay) {

    overlay.addEventListener("click", () => {

      sidebar.classList.remove("open");

      overlay.classList.remove("active");

    });

  }


  /* =====================================================
     CLOSE MOBILE SIDEBAR AFTER NAV CLICK
  ===================================================== */

  document
    .querySelectorAll(".nav-item")
    .forEach(item => {

      item.addEventListener("click", () => {

        if (window.innerWidth <= 768) {

          sidebar?.classList.remove("open");

          overlay?.classList.remove("active");

        }

      });

    });


  /* =====================================================
     COURSE FILTER
  ===================================================== */

  function filterCourses() {

    if (!coursesGrid || !levelFilter) {
      return;
    }

    const selected =
      levelFilter.value;

    const cards =
      coursesGrid.querySelectorAll(
        ".course-card"
      );

    cards.forEach(card => {

      const level =
        card.dataset.level;

      if (
        selected === "all" ||
        level === selected
      ) {

        card.style.display = "flex";

      } else {

        card.style.display = "none";

      }

    });

  }


  if (levelFilter) {

    levelFilter.addEventListener(
      "change",
      filterCourses
    );

  }


  /* =====================================================
     UPDATE CAREER
  ===================================================== */

  if (updateBtn) {

    updateBtn.addEventListener(
      "click",
      () => {

        const selectedCareer =
          targetCareer?.value;

        if (!selectedCareer) {

          showAlert(
            "Please select a target career first.",
            "error"
          );

          return;

        }


        /* Update overview */

        if (overviewCareer) {

          overviewCareer.textContent =
            selectedCareer;

        }


        /* Update subtitle */

        if (courseSubtitle) {

          courseSubtitle.textContent =
            `Courses recommended for ${selectedCareer}.`;

        }


        /* Update status */

        if (careerStatusText) {

          careerStatusText.textContent =
            "Career Profile Active";

        }


        /* Save locally */

        localStorage.setItem(
          "careerSetuTargetCareer",
          selectedCareer
        );


        showAlert(
          `✓ Courses updated for ${selectedCareer}`,
          "success"
        );

      }
    );

  }


  /* =====================================================
     COURSE BUTTONS
  ===================================================== */

  function setupCourseButtons() {

    const buttons =
      document.querySelectorAll(
        ".course-action"
      );


    buttons.forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const card =
            button.closest(".course-card");

          const title =
            card?.querySelector("h3")
              ?.textContent
              .trim();


          if (!title) {
            return;
          }


          localStorage.setItem(
            "careerSetuSelectedCourse",
            title
          );


          button.textContent =
            "✓ Selected";


          button.style.background =
            "#16a34a";

          button.style.borderColor =
            "#16a34a";

          button.style.color =
            "#ffffff";


          showAlert(
            `✓ ${title} selected. You can continue to Roadmap.`,
            "success"
          );

        }
      );

    });

  }


  setupCourseButtons();


  /* =====================================================
     OVERVIEW COUNTS
  ===================================================== */

  function updateOverview() {

    const cards =
      document.querySelectorAll(
        ".course-card"
      );


    if (courseCount) {

      courseCount.textContent =
        cards.length;

    }


    let totalWeeks = 0;


    cards.forEach(card => {

      const duration =
        card.querySelector(
          ".course-duration"
        )?.textContent || "";


      const match =
        duration.match(/\d+/);


      if (match) {

        totalWeeks +=
          Number(match[0]);

      }

    });


    if (totalDuration) {

      totalDuration.textContent =
        `${totalWeeks} Weeks`;

    }

  }


  updateOverview();


  /* =====================================================
     LOAD SAVED CAREER
  ===================================================== */

  const savedCareer =
    localStorage.getItem(
      "careerSetuTargetCareer"
    );


  if (
    savedCareer &&
    targetCareer
  ) {

    const optionExists =
      [...targetCareer.options]
        .some(
          option =>
            option.value === savedCareer
        );


    if (optionExists) {

      targetCareer.value =
        savedCareer;


      if (overviewCareer) {

        overviewCareer.textContent =
          savedCareer;

      }


      if (courseSubtitle) {

        courseSubtitle.textContent =
          `Courses recommended for ${savedCareer}.`;

      }

    }

  }


  /* =====================================================
     ALERT FUNCTION
  ===================================================== */

  function showAlert(message, type) {

    if (!careerAlert) {
      return;
    }


    const background =
      type === "error"
        ? "#fef2f2"
        : "#ecfdf5";


    const border =
      type === "error"
        ? "#fecaca"
        : "#a7f3d0";


    const color =
      type === "error"
        ? "#b91c1c"
        : "#047857";


    careerAlert.innerHTML = `
      <div
        class="career-alert"
        style="
          background:${background};
          border-color:${border};
          color:${color};
        "
      >
        ${message}
      </div>
    `;


    setTimeout(() => {

      careerAlert.innerHTML = "";

    }, 4000);

  }


  /* =====================================================
     SIDEBAR USER FROM LOCAL STORAGE
  ===================================================== */

  try {

    const savedProfile =
      localStorage.getItem(
        "careerSaathiProfile"
      );


    if (savedProfile) {

      const profile =
        JSON.parse(savedProfile);


      const name =
        profile.fullName ||
        profile.name ||
        "Student";


      const email =
        profile.email ||
        "Student";


      const avatar =
        document.getElementById(
          "sidebar-user-avatar"
        );


      const nameElement =
        document.getElementById(
          "sidebar-user-name"
        );


      const emailElement =
        document.getElementById(
          "sidebar-user-email"
        );


      if (nameElement) {

        nameElement.textContent =
          name;

      }


      if (emailElement) {

        emailElement.textContent =
          email;

      }


      if (avatar) {

        avatar.textContent =
          name
            .charAt(0)
            .toUpperCase();

      }

    }

  } catch (error) {

    console.warn(
      "Profile loading skipped:",
      error
    );

  }


  /* =====================================================
     LOGOUT
  ===================================================== */

  const logoutBtn =
    document.getElementById(
      "logout-btn"
    );


  if (logoutBtn) {

    logoutBtn.addEventListener(
      "click",
      async () => {

        try {

          /*
             Firebase logout is normally
             handled by auth.js.

             If auth.js has already attached
             the event, this button remains
             compatible.
          */

          localStorage.removeItem(
            "careerSetuTargetCareer"
          );

        } catch (error) {

          console.warn(error);

        }

      }
    );

  }


});

/* =========================================================
   CareerSetu AI
   Career Search & Course Filter
   File: career-search.js
========================================================= */

(function () {

  "use strict";


  /* =======================================================
     WAIT FOR DOM
  ======================================================= */

  document.addEventListener("DOMContentLoaded", function () {


    /* =====================================================
       GET ELEMENTS
    ===================================================== */

    const searchInput =
      document.getElementById("courseSearch");

    const clearSearchButton =
      document.getElementById("clearCourseSearch");

    const levelFilter =
      document.getElementById("levelFilter");

    const coursesGrid =
      document.getElementById("coursesGrid");

    const courseCount =
      document.getElementById("courseCount");

    const noResults =
      document.getElementById("noCourseResults");

    const resetSearchButton =
      document.getElementById("resetCourseSearch");


    /* =====================================================
       CHECK REQUIRED ELEMENTS
    ===================================================== */

    if (!searchInput) {
      console.error(
        "Career Search Error: #courseSearch not found."
      );
      return;
    }


    if (!levelFilter) {
      console.error(
        "Career Search Error: #levelFilter not found."
      );
      return;
    }


    if (!coursesGrid) {
      console.error(
        "Career Search Error: #coursesGrid not found."
      );
      return;
    }


    /* =====================================================
       GET COURSE CARDS
    ===================================================== */

    function getCourseCards() {

      return Array.from(
        coursesGrid.querySelectorAll(".course-card")
      );

    }


    /* =====================================================
       NORMALIZE TEXT
       
       Converts:
       "  Machine   Learning  "
       
       into:
       "machine learning"
    ===================================================== */

    function normalizeText(value) {

      return String(value || "")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, " ");

    }


    /* =====================================================
       GET SEARCH QUERY
    ===================================================== */

    function getSearchQuery() {

      return normalizeText(
        searchInput.value
      );

    }


    /* =====================================================
       GET SELECTED LEVEL
    ===================================================== */

    function getSelectedLevel() {

      return normalizeText(
        levelFilter.value
      );

    }


    /* =====================================================
       CREATE SEARCHABLE COURSE TEXT
       
       Searches:
       - Course title
       - Description
       - Level
       - Tags
       - Duration
    ===================================================== */

    function getCourseSearchText(card) {

      const title =
        card.querySelector("h3");

      const description =
        card.querySelector("p");

      const level =
        card.querySelector(".course-level");

      const tags =
        card.querySelectorAll(".course-tag");

      const duration =
        card.querySelector(".course-duration");


      let searchableText = "";


      /* Course title */

      if (title) {

        searchableText +=
          " " + title.textContent;

      }


      /* Course description */

      if (description) {

        searchableText +=
          " " + description.textContent;

      }


      /* Course level */

      if (level) {

        searchableText +=
          " " + level.textContent;

      }


      /* Course tags */

      tags.forEach(function (tag) {

        searchableText +=
          " " + tag.textContent;

      });


      /* Course duration */

      if (duration) {

        searchableText +=
          " " + duration.textContent;

      }


      return normalizeText(
        searchableText
      );

    }


    /* =====================================================
       GET COURSE LEVEL
    ===================================================== */

    function getCourseLevel(card) {

      /*
        First try data-level
      */

      if (card.dataset.level) {

        return normalizeText(
          card.dataset.level
        );

      }


      /*
        Fallback to visible level badge
      */

      const level =
        card.querySelector(".course-level");


      if (level) {

        return normalizeText(
          level.textContent
        );

      }


      return "";

    }


    /* =====================================================
       SHOW / HIDE CLEAR BUTTON
    ===================================================== */

    function updateClearButton() {

      if (!clearSearchButton) {
        return;
      }


      const hasSearchText =
        searchInput.value.trim().length > 0;


      clearSearchButton.hidden =
        !hasSearchText;

    }


    /* =====================================================
       SHOW / HIDE NO RESULTS
    ===================================================== */

    function updateNoResults(visibleCount) {

      if (!noResults) {
        return;
      }


      noResults.hidden =
        visibleCount !== 0;

    }


    /* =====================================================
       UPDATE COURSE COUNT
    ===================================================== */

    function updateCourseCount(visibleCount) {

      if (!courseCount) {
        return;
      }


      courseCount.textContent =
        visibleCount;

    }


    /* =====================================================
       FILTER COURSES
    ===================================================== */

    function filterCourses() {

      const searchQuery =
        getSearchQuery();


      const selectedLevel =
        getSelectedLevel();


      const courseCards =
        getCourseCards();


      let visibleCount = 0;


      /* ---------------------------------------------------
         LOOP THROUGH COURSES
      --------------------------------------------------- */

      courseCards.forEach(function (card) {


        /*
          Get searchable course content
        */

        const searchableText =
          getCourseSearchText(card);


        /*
          Get course level
        */

        const courseLevel =
          getCourseLevel(card);


        /*
          SEARCH MATCH
          
          Empty search = match everything
        */

        const searchMatches =
          searchQuery === "" ||
          searchableText.includes(
            searchQuery
          );


        /*
          LEVEL MATCH
          
          "all" = match every level
        */

        const levelMatches =
          selectedLevel === "all" ||
          courseLevel === selectedLevel;


        /*
          FINAL MATCH
        */

        const shouldShow =
          searchMatches &&
          levelMatches;


        /*
          Show / hide course
        */

        card.hidden =
          !shouldShow;


        /*
          Count visible courses
        */

        if (shouldShow) {

          visibleCount++;

        }

      });


      /* ---------------------------------------------------
         UPDATE UI
      --------------------------------------------------- */

      updateCourseCount(
        visibleCount
      );


      updateNoResults(
        visibleCount
      );


      updateClearButton();


    }


    /* =====================================================
       CLEAR SEARCH
    ===================================================== */

    function clearSearch() {

      searchInput.value = "";


      /*
        Apply filter immediately
      */

      filterCourses();


      /*
        Put cursor back into search
      */

      searchInput.focus();

    }


    /* =====================================================
       SEARCH INPUT EVENT
       
       Runs while user types.
    ===================================================== */

    searchInput.addEventListener(
      "input",
      function () {

        filterCourses();

      }
    );


    /* =====================================================
       LEVEL FILTER EVENT
    ===================================================== */

    levelFilter.addEventListener(
      "change",
      function () {

        filterCourses();

      }
    );


    /* =====================================================
       CLEAR BUTTON EVENT
    ===================================================== */

    if (clearSearchButton) {

      clearSearchButton.addEventListener(
        "click",
        function () {

          clearSearch();

        }
      );

    }


    /* =====================================================
       RESET SEARCH BUTTON
       
       Clears BOTH:
       - Search
       - Level filter
    ===================================================== */

    if (resetSearchButton) {

      resetSearchButton.addEventListener(
        "click",
        function () {

          searchInput.value = "";

          levelFilter.value = "all";


          filterCourses();


          searchInput.focus();

        }
      );

    }


    /* =====================================================
       ESCAPE KEY
       
       Press ESC while inside search to clear it.
    ===================================================== */

    searchInput.addEventListener(
      "keydown",
      function (event) {

        if (event.key === "Escape") {

          event.preventDefault();

          clearSearch();

        }

      }
    );


    /* =====================================================
       ENTER KEY
       
       Prevents accidental form submission if this
       search is later placed inside a form.
    ===================================================== */

    searchInput.addEventListener(
      "keydown",
      function (event) {

        if (event.key === "Enter") {

          event.preventDefault();

          filterCourses();

        }

      }
    );


    /* =====================================================
       INITIAL FILTER
       
       Makes sure:
       - Count is correct
       - All courses visible
       - Clear button hidden
       - No-results hidden
    ===================================================== */

    filterCourses();


    /* =====================================================
       OPTIONAL GLOBAL API
       
       Allows other scripts to manually trigger search.
       
       Example:
       window.CareerSearch.clear();
       window.CareerSearch.refresh();
    ===================================================== */

    window.CareerSearch = {

      filter: filterCourses,

      clear: clearSearch,

      refresh: filterCourses,

      getQuery: getSearchQuery,

      getLevel: getSelectedLevel

    };


    /* =====================================================
       READY MESSAGE
       
       Useful while developing.
    ===================================================== */

    console.log(
      "CareerSetu: Course search initialized successfully."
    );


  });

})();
