import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // DYNAMICALLY REDIRECT TO THE FIRST AVAILABLE ROUTE
    navigate("/dashboard");
  }, [navigate]);

  return null; // OR RENDER A LOADING SPINNER
};

export default Index;
