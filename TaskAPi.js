async function fetchTasks() {
  try {
    const response = await axios.get(
      "http://185.203.217.168/api/get_tasks?user_api_hash=$2y$10$F4RpJGDpBDWO2ie448fQAu2Zo0twdwyBdMmnbeSqFbEkjGYocP.Y6"
    );
    console.log(response.data); // Debug line
    return response.data.tasks; // Adjust based on the actual structure of the response
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }
}
