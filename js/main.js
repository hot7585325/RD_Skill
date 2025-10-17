 const btn_1 = document.getElementById("btn_1")
    btn_1.addEventListener("click", () => {toggleDisplayById("content_1") });

     // 切換 dom 顯示
    function toggleDisplayById(id, state = "block") {
      const element = document.getElementById(id);
      if (!element) {
        console.warn(`找不到 id 為 "${id}" 的元素`);
        return;
      }

      // 取得當前顯示狀態（計算後樣式）
      const currentDisplay = window.getComputedStyle(element).display;

      if (currentDisplay === "none") {
        // 顯示
        element.style.display = state;
      } else {
        // 隱藏
        element.style.display = "none";
      }
    }


    // document.getElementById("openWin").addEventListener("click", () => {
    //   window.open("https://example.com", "_blank", "width=600,height=400");
    // });