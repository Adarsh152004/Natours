/*eslint-disable*/
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import { showAlert } from "./alerts.js";

export const bookTour = async (tourId) => {
  try {
    const stripe = await loadStripe(
      "pk_test_51RIG7ASEnq0PcHPPvgGWxoadBg2GUiMbgqayMboEOSurZRffC5ufFZiExptZzlwc9BMo0nFim0Pbjn4p94cZvNN600nfTh3970",
    );
    //1) Get checkout session from API endpoint
    const session = await axios(
      `http://127.0.0.1:3001/api/v1/bookings/checkout-session/${tourId}`,
    );

    console.log(session);

    //2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert("error", err.response.data.message);
  }
};
