document.addEventListener("DOMContentLoaded", () => {
  // Initialize Swiper
  const swiper = new Swiper(".swiper-container", {
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
  });

  const addTextBtn = document.getElementById("addText");
  const fontSelector = document.getElementById("fontSelector");
  const increaseFontSizeBtn = document.getElementById("increaseFontSize");
  const decreaseFontSizeBtn = document.getElementById("decreaseFontSize");
  let selectedText = null;

  //undo redo
  const undoBtn = document.getElementById("undo");
  const redoBtn = document.getElementById("redo");
  let history = []; // To track history
  let historyIndex = -1; // Current history index

  // Create default text on each canvas
  document.querySelectorAll(".canva").forEach((canva, index) => {
    const defaultText = createTextBox(`Default Text ${index + 1}`);
    canva.appendChild(defaultText);
  });

  // Add new text
  addTextBtn.addEventListener("click", () => {
    const activeCanvas = swiper.slides[swiper.activeIndex].querySelector(".canva");
    const newText = createTextBox("New Text");
    activeCanvas.appendChild(newText);
    saveHistory();
  });

  // Font style change
  fontSelector.addEventListener("change", () => {
    if (selectedText) {
      selectedText.style.fontFamily = fontSelector.value;
      saveHistory();
    }
  });

  // Increase font size
  increaseFontSizeBtn.addEventListener("click", () => {
    if (selectedText) {
      const currentSize = parseInt(window.getComputedStyle(selectedText).fontSize, 10);
      selectedText.style.fontSize = `${currentSize + 2}px`;
      saveHistory();
    }
  });

  // Decrease font size
  decreaseFontSizeBtn.addEventListener("click", () => {
    if (selectedText) {
      const currentSize = parseInt(window.getComputedStyle(selectedText).fontSize, 10);
      selectedText.style.fontSize = `${Math.max(10, currentSize - 2)}px`;
      saveHistory();
    }
  });

  // Undo action
  undoBtn.addEventListener("click", () => {
    if (historyIndex > 0) {
      historyIndex--;
      loadHistory();
    }
  });

  // Redo action
  redoBtn.addEventListener("click", () => {
    if (historyIndex < history.length - 1) {
      historyIndex++;
      loadHistory();
    }
  });


  // Create draggable text box
  function createTextBox(content) {
    const textBox = document.createElement("div");
    textBox.className = "text-box";
    textBox.contentEditable = "true";
    textBox.textContent = content;
    textBox.style.left = "50%";
    textBox.style.top = "50%";
    textBox.style.transform = "translate(-50%, -50%)";
    // Dragging logic
    textBox.addEventListener("mousedown", (e) => {
      selectedText = textBox;
      let offsetX = e.clientX - textBox.getBoundingClientRect().left;
      let offsetY = e.clientY - textBox.getBoundingClientRect().top;
      const onMouseMove = (event) => {
        const canvasRect = textBox.parentElement.getBoundingClientRect();
        let left = event.clientX - canvasRect.left - offsetX;
        let top = event.clientY - canvasRect.top - offsetY;
        // Restrict movement within canvas
        left = Math.max(0, Math.min(left, canvasRect.width - textBox.offsetWidth));
       top = Math.max(0, Math.min(top, canvasRect.height - textBox.offsetHeight));
        textBox.style.left = `${left}px`;
        textBox.style.top = `${top}px`;
        textBox.style.transform = "translate(0, 0)";
      };
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", () => {
        document.removeEventListener("mousemove", onMouseMove);
        saveHistory();
      }, { once: true });
    });
    textBox.addEventListener("input", saveHistory);

    return textBox;
  }


  function saveHistory() {
    const activeCanvas = swiper.slides[swiper.activeIndex].querySelector(".canva");
    const canvasTexts = Array.from(activeCanvas.querySelectorAll(".text-box")).map((textBox) => ({
      content: textBox.textContent,
      fontSize: textBox.style.fontSize,
      fontFamily: textBox.style.fontFamily,
      left: textBox.style.left,
      top: textBox.style.top,
    }));

    // Only save to history if the state changes
    if (historyIndex === history.length - 1 || history.length === 0) {
      history.push(canvasTexts);
      historyIndex++;
    } else {
      history.splice(historyIndex + 1, history.length - historyIndex - 1);
      history.push(canvasTexts);
      historyIndex++;
    }
  }

  // Load a specific history state (used for undo/redo)
  function loadHistory() {
    const activeCanvas = swiper.slides[swiper.activeIndex].querySelector(".canva");
    const canvasTexts = history[historyIndex];

    // Clear current text elements and load the saved ones
    activeCanvas.innerHTML = "";
    canvasTexts.forEach((textData) => {
      const newText = createTextBox(textData.content);
      newText.style.fontSize = textData.fontSize;
      newText.style.fontFamily = textData.fontFamily;
      newText.style.left = textData.left;
      newText.style.top = textData.top;
      activeCanvas.appendChild(newText);
    });
  }
});












