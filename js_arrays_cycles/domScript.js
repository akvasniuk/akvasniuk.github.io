import {
  generateArray,
  selectionSort,
  bubbleSort,
  insertionSort,
} from "./script.js";

const generateArrayButton = document.getElementById("generateBtn");
const sortButton = document.getElementById("sortBtn");

const unsortedDivs = document.querySelectorAll("div[id$='unsorted']");
const sortedDivs = Array.from(document.querySelectorAll("div[id$='sorted']"));

function getArrayOptions() {
  const arrLength = +document.getElementById("arrLength").value || 10;
  const maxEl = +document.getElementById("maxEl").value || 100;

  return [arrLength, maxEl];
}

generateArrayButton.addEventListener("click", (e) => {
  const [arrLength, maxEl] = getArrayOptions();

  for (const element of unsortedDivs) {
    element.innerText = generateArray(arrLength, maxEl);
    element.classList.add("array-output");
  }
});

sortButton.addEventListener("click", (e) => {
  for (let element of unsortedDivs) {
    if (element.innerText.includes("Generate")) {
      alert("Please generate array");
      return;
    }

    const arrText = "[" + element.innerText + "]";
    const unsortedArr = JSON.parse(arrText);

    switch (element.id) {
      case "bubble-unsorted":
        const bubbleSortEl = sortedDivs.find((el) => el.id === "bubble-sorted");
        bubbleSortEl.innerText = bubbleSort(unsortedArr);
        bubbleSortEl.classList.add("array-output");
        break;
      case "selection-unsorted":
        const selectionSortEl = sortedDivs.find(
          (el) => el.id === "selection-sorted",
        );
        selectionSortEl.innerText = selectionSort(unsortedArr);
        selectionSortEl.classList.add("array-output");
        break;
      case "insertion-unsorted":
        const insertionSortEl = sortedDivs.find(
          (el) => el.id === "insertion-sorted",
        );
        insertionSortEl.innerText = insertionSort(unsortedArr);
        insertionSortEl.classList.add("array-output");
        break;
    }
  }
});
