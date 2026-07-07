function generateArray(length, max = 100) {
  return Array.from({ length }, () => Math.floor(Math.random() * max));
}

// Bubble Sort
function bubbleSort(arr) {
  const localArr = Array.from(arr);

  for (let i = 0; i < localArr.length; i++) {
    let swapped = false;

    for (let j = 0; j < localArr.length - 1 - i; j++) {
      if (localArr[j] > localArr[j + 1]) {
        const swap = localArr[j];
        localArr[j] = localArr[j + 1];
        localArr[j + 1] = swap;

        swapped = true;
      }
    }

    if (!swapped) {
      return localArr;
    }
  }

  return localArr;
}

console.log("\n");
console.log("=========================================");
console.log("           BUBBLE SORT                ");
console.log("=========================================");
console.log("\n");

let generatedArray = generateArray(10);
console.log("Unsorted array:", generatedArray);
let sortedArray = bubbleSort(generatedArray);
console.log("Bubble sort:", sortedArray);

// Selection Sort
function selectionSort(arr) {
  const localArr = Array.from(arr);

  for (let i = 0; i < localArr.length; i++) {
    let minIndex = i;

    for (let j = i + 1; j < localArr.length; j++) {
      if (localArr[j] < localArr[minIndex]) {
        minIndex = j;
      }
    }

    if (minIndex !== i) {
      const swap = localArr[i];
      localArr[i] = localArr[minIndex];
      localArr[minIndex] = swap;
    }
  }

  return localArr;
}

console.log("\n");
console.log("=========================================");
console.log("           SELECTION SORT                ");
console.log("=========================================");
console.log("\n");

generatedArray = generateArray(10);
console.log("Unsorted array:", generatedArray);
sortedArray = selectionSort(generatedArray);
console.log("Selection sort:", sortedArray);

//Insertion Sort
function insertionSort(arr) {
  const localArr = Array.from(arr);

  for (let i = 1; i < localArr.length; i++) {
    let current = localArr[i];
    let j = i - 1;

    while (j >= 0 && localArr[j] > current) {
      localArr[j + 1] = localArr[j];
      j--;
    }

    localArr[j + 1] = current;
  }

  return localArr;
}

console.log("\n");
console.log("=========================================");
console.log("           INSERTION SORT                ");
console.log("=========================================");
console.log("\n");

generatedArray = generateArray(10);
console.log("Unsorted array:", generatedArray);
sortedArray = insertionSort(generatedArray);
console.log("Insertion sort:", sortedArray);

export { generateArray, bubbleSort, insertionSort, selectionSort };
