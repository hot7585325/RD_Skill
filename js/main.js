// 大按鈕展開中按鈕
document.querySelectorAll(".big-btn").forEach(bigBtn => {
  bigBtn.addEventListener("click", () => {
    const project = bigBtn.parentElement;
    const midBtns = project.querySelector(".mid-btns");

    // 收合其他
    document.querySelectorAll(".mid-btns").forEach(mb => {
      if (mb !== midBtns) mb.classList.remove("show");
    });

    midBtns.classList.toggle("show");
    document.getElementById("content-title").textContent = project.getAttribute("data-title");
  });
});

// 中按鈕展開小按鈕
document.querySelectorAll(".mid-btn").forEach(midBtn => {
  midBtn.addEventListener("click", () => {
    const nextSmallBtns = midBtn.nextElementSibling;

    // 收合同層其他
    // midBtn.parentElement.querySelectorAll(".small-btns").forEach(sb => {
    //   if (sb !== nextSmallBtns) sb.classList.remove("show");
    // });

    nextSmallBtns.classList.toggle("show");
  });
});

// 小按鈕顯示內容
document.querySelectorAll(".small-btn").forEach(smallBtn => {
  smallBtn.addEventListener("click", () => {
    const targetId = smallBtn.getAttribute("data-target");
    const contentBlock = document.getElementById(targetId);

    if (contentBlock) {
      document.getElementById("time").textContent = contentBlock.getAttribute("data-time");
      document.getElementById("content-text").innerHTML = contentBlock.innerHTML;
    }
  });
});