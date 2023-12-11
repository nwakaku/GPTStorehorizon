import { useState, useEffect } from "react";

export const useFetchData = (URI) => {
  const [cardData, setCardData] = useState({
    name: "",
    image: "",
    match: "",
    description: "",
    priceHour: "",
    assistantID: "",
  });

  useEffect(() => {
    const fetchDataFromUrl = async (url) => {
      try {
        const cleanedUrl = url.replace(/^ipfs:\/\//, "");
        const src = `https://ipfs.io/ipfs/${cleanedUrl}`;
        const response = await fetch(src);
        if (!response.ok) {
          throw new Error(`Failed to fetch data from ${url}`);
        }

        const data = await response.json();
        console.log(data);
        return data;
      } catch (error) {
        console.error(error.message);
      }
    };

    const fetchData = async () => {
      const data = await fetchDataFromUrl(URI);

      if (data) {
        // Update the component state with the fetched data
        const ipfsUrl = data.image;
        const cleanedUrl = ipfsUrl.replace(/^ipfs:\/\//, "");

        setCardData({
          name: data.name,
          image: cleanedUrl,
          match: data.match,
          description: data.description,
          priceHour: data.priceHour,
          assistantID: data.assistantID,
        });
      }
    };

    fetchData();
  }, [URI]);

  return cardData;
};
