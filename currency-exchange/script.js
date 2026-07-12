const form = document.forms[0];
const dateType = Array.from(
  document.querySelectorAll("input[name='dateType']"),
);
const BASE_URL = "https://bank.gov.ua/NBU_Exchange/exchange_site";

setDateRestrictions();

dateType.forEach((element) => {
  element.addEventListener("change", (e) => {
    renderDateTypes(e.target.id);
  });
});

const selectByStartDayElement = document.querySelector("#inputStartDay");
const selectByEndDayElement = document.querySelector("#inputEndDay");
const selectByMonthElement = document.querySelector("#inputMonth");
const selectByYearElement = document.querySelector("#inputYear");
const resultBlock = document.getElementById("resultBlock");

renderDateTypes(dateType.find((element) => element.checked).id);

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const selectedDateType = dateType.values().find((element) => element.checked);
  const dateValues = getDateValuesByParam(selectedDateType);

  let startDate, endDate;

  if (selectedDateType.id === "typeDay") {
    startDate = new Date(dateValues[0]);
    endDate = new Date(dateValues[1]);

    if (endDate - startDate < 0) {
      alert("Start date must be less than end day");
      return;
    } else if (endDate - startDate === 0) {
      alert("Please select different days");
      return;
    }
  } else {
    startDate = new Date(dateValues[0]);
  }

  resultBlock.classList.remove("d-none");
  const toCurrency = document.getElementById("toCurrency").value;

  switch (selectedDateType.id) {
    case "typeYear":
      await fetchDateByYear(startDate.getFullYear(), toCurrency);
      break;
    case "typeMonth":
      await fetchDateByMonth(startDate, toCurrency);
      break;
    case "typeDay":
      await fetchDateByDays(startDate, endDate, toCurrency);
      break;
  }
});

function setDateRestrictions() {
  const today = new Date();

  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");

  const maxDateStr = `${yyyy}-${mm}-${dd}`;
  const maxMonthStr = `${yyyy}-${mm}`;

  const startDayInput = document.getElementById("datePickerStartDay");
  const endDayInput = document.getElementById("datePickerEndDay");

  startDayInput.min = "1996-09-02";
  startDayInput.max = maxDateStr;

  endDayInput.min = "1996-09-02";
  endDayInput.max = maxDateStr;

  const monthInput = document.getElementById("datePickerMonth");
  monthInput.min = "1996-09";
  monthInput.max = maxMonthStr;

  const yearInput = document.getElementById("datePickerYear");
  yearInput.min = "1996";
  yearInput.max = yyyy;
}

async function fetchDateByYear(year, currency) {
  const urlParam = new URLSearchParams({
    start: `${year}0101`,
    end: `${year}1231`,
    valcode: currency,
    sort: "exchangedate",
    order: "desc",
    json: "true",
  });

  const data = await fetch(`${BASE_URL}?${urlParam}`);
  const yearByDate = await data.json();

  const groupedByMonth = Object.groupBy(yearByDate, (item) => {
    const dateParts = item.exchangedate.split(".");
    const month = dateParts[1];

    return month;
  });

  const averageByMonthData = Object.entries(groupedByMonth)
    .reduce((acc, [month, items]) => {
      const sum = items.reduce((total, item) => total + item.rate_per_unit, 0);
      const average = Number((sum / items.length).toFixed(2));

      acc.push({
        month: month,
        averageRate: average,
      });

      return acc;
    }, [])
    .sort((a, b) => a.month - b.month)
    .map((val) => val.averageRate);

  renderExchangeRateChart(getMonths(), averageByMonthData, currency);
}

function getMonths(length = 12) {
  return Array.from({ length }, (_, i) => {
    return new Date(0, i).toLocaleDateString("en", { month: "long" });
  });
}

async function fetchDateByMonth(date, currency) {
  const urlParam = new URLSearchParams();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const dayInMonth = getDaysInMonth(year, month);
  const convertMonth = month < 10 ? `0${month}` : month;

  urlParam.append("start", `${year}${convertMonth}01`);
  urlParam.append("end", `${year}${convertMonth}${dayInMonth}`);
  urlParam.append("valcode", currency);
  urlParam.append("sort", "exchangedate");
  urlParam.append("order", "desc");
  urlParam.append("json", "true");

  const data = await fetch(`${BASE_URL}?${urlParam}`);
  let monthByDate = await data.json();

  monthByDate = monthByDate.sort((a, b) =>
    normalizeDate(a.exchangedate).localeCompare(normalizeDate(b.exchangedate)),
  );

  const labels = monthByDate.map((date) => date.exchangedate);
  const monthData = monthByDate.map((date) => date.rate_per_unit);

  renderExchangeRateChart(labels, monthData, currency);
}

function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

function normalizeDate(dateStr) {
  const [day, month, year] = dateStr.split(".");
  return `${year}-${month}-${day}`;
}

async function fetchDateByDays(startDate, endDate, currency) {
  const msDifference = endDate - startDate;
  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  const totalDays = Math.round(msDifference / millisecondsPerDay);

  if (totalDays > 31) {
    alert("Max range 31 days");
    return;
  }

  const formattedStartDate = startDate
    .toLocaleDateString("sv-SE")
    .replaceAll("-", "");

  const formattedEndDate = endDate
    .toLocaleDateString("sv-SE")
    .replaceAll("-", "");

  const urlParam = new URLSearchParams({
    start: formattedStartDate,
    end: formattedEndDate,
    valcode: currency,
    sort: "exchangedate",
    order: "desc",
    json: "true",
  });

  const data = await fetch(`${BASE_URL}?${urlParam}`);
  let daysByDate = await data.json();

  daysByDate = daysByDate.sort((a, b) =>
    normalizeDate(a.exchangedate).localeCompare(normalizeDate(b.exchangedate)),
  );

  const labels = daysByDate.map((date) => date.exchangedate);
  const daysData = daysByDate.map((date) => date.rate_per_unit);

  renderExchangeRateChart(labels, daysData, currency);
}

function renderExchangeRateChart(labels, data, currency, params) {
  resultBlock.querySelector("canvas")?.remove();
  const canva = document.createElement("canvas");

  new Chart(canva, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: `${currency} TO UAH`,
          data: data,
          fill: true,
          backgroundColor: "rgba(75, 192, 192, 0.1)",
          borderColor: "rgb(75, 192, 192)",
          borderWidth: 2,
          tension: 0.3,
          pointRadius: labels.length > 31 ? 0 : 3,
          pointHoverRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          bottom: 20,
        },
      },
      plugins: {
        legend: {
          display: true,
          position: "top",
          labels: {
            font: {
              family: "'Segoe UI', 'Roboto', sans-serif",
              size: 13,
            },
          },
        },
      },
    },
  });

  resultBlock.appendChild(canva);
}

function getDateValuesByParam(selectedElement) {
  switch (selectedElement.id) {
    case "typeDay":
      return [
        selectByStartDayElement.querySelector("input").value,
        selectByEndDayElement.querySelector("input").value,
      ];
    case "typeMonth":
      return [selectByMonthElement.querySelector("input").value];
    case "typeYear":
      return [selectByYearElement.querySelector("input").value];
    default:
      return [];
  }
}

function renderDateTypes(dateParam) {
  selectByStartDayElement.classList.toggle("d-none", dateParam !== "typeDay");
  selectByEndDayElement.classList.toggle("d-none", dateParam !== "typeDay");
  selectByMonthElement.classList.toggle("d-none", dateParam !== "typeMonth");
  selectByYearElement.classList.toggle("d-none", dateParam !== "typeYear");
}
