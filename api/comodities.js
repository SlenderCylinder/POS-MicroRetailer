import api from "./api";

let items = [];

// Function to fetch data from the cloud source
export async function getComodities() {
  try {
    // Fetch data from your cloud source
    const response = await api.get(`/commodities`);
    const data = response.data;

    // Update the 'items' array with the fetched data
    items = data;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

// Initial data population (optional)
// You can call this function when your app starts to initially populate the 'items' array.
export async function populateComodities() {
  await getComodities();
}

// Export a function that resolves with 'items' when data is available
export function getItems() {
  return new Promise(async (resolve) => {
    if (items.length === 0) {
      await populateComodities();
    }
    resolve(items);
  });
}
