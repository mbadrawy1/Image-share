import React, { useEffect, useState } from "react";
import axios from "axios";

const GetLocation = (props) => {
  const [region, setRegion] = useState("جاري جلب المنطقة ...");
  const [country, setCountry] = useState("جاري جلب الدولة ...");

  useEffect(() => {
    printCurrentPosition();
  }, []);

  useEffect(() => {
    handleLocation();
  }, [country, region]);

  const printCurrentPosition = async () => {
    try {
      // Using browser's geolocation API instead of Capacitor
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const response = await axios.get(
              `https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json&accept-language=ar`
            );
            setRegion(
              response.data.address.state || response.data.address.region
            );
            setCountry(response.data.address.country);
          } catch (e) {
            console.log(e);
            setCountry("");
            setRegion("");
          }
        },
        (error) => {
          console.log("Geolocation error:", error);
          setCountry("");
          setRegion("");
        }
      );
    } catch (e) {
      console.log(e);
      setCountry("");
      setRegion("");
    }
  };

  const handleLocation = () => {
    props.country(country);
    props.region(region);
  };

  return (
    <div
      style={{
        display: "flex",
        padding: "16px",
        alignItems: "center",
        borderBottom: "1px solid #ddd",
        backgroundColor: "#fff",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            marginBottom: "12px",
            alignItems: "center",
          }}
        >
          <label
            style={{
              color: "#ffb400",
              fontWeight: "500",
              marginRight: "8px",
              width: "60px",
            }}
          >
            الدولة
          </label>
          <input
            disabled
            value={country}
            style={{
              flex: 1,
              padding: "8px 12px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              backgroundColor: "#f5f5f5",
              textAlign: "right",
              direction: "rtl",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <label
            style={{
              color: "#ffb400",
              fontWeight: "500",
              marginRight: "8px",
              width: "60px",
            }}
          >
            المنطقة
          </label>
          <input
            disabled
            value={region}
            style={{
              flex: 1,
              padding: "8px 12px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              backgroundColor: "#f5f5f5",
              textAlign: "right",
              direction: "rtl",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default GetLocation;
