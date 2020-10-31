/*eslint-disable camelcase */
import React from "react";
import logger from "sabio-debug";
import PropTypes from "prop-types";
import RegisterCardForm from "./RegisterCardForm";
import LocationsModal from "../locations/LocationsModal";
import { Label } from "reactstrap";
import { Accordion, Card } from "react-bootstrap";

const _logger = logger.extend("registerCard");

class RegisterCard extends React.Component {
  state = {
    customerId: this.props.location.state.payload.customerId,
    email: this.props.location.state.payload.email,
    formData: { locationId: 0 },
    locationEventKey: "0",
    paymentEventKey: "1",
    hasLocation: false,
    locationData: {
      city: "City",
      latitude: 33.6973536,
      lineOne: "Address",
      lineTwo: "",
      locationTypeId: 1,
      longitude: -117.7132361,
      stateId: "State",
      zip: "Zip Code",
    },
  };
  backCheckout = () => {
    this.props.history.push("/checkout");
  };
  onSaveAddress = (id, address, selectedState) => {
    this.toggleModal();
    this.setState((prevState) => {
      return {
        ...(prevState.formData.locationId = id),
        locationData: address,
        selectedState,
        hasLocation: true,
      };
    });
  };

  toggleModal = () => {
    this.setState((prevState) => {
      return {
        isOpen: !prevState.isOpen,
      };
    });
  };
  changeEventKey = () => {
    this.setState(() => {
      if (this.state.locationEventKey === "0") {
        return { locationEventKey: "1", paymentEventKey: "0" };
      } else {
        return { locationEventKey: "0", paymentEventKey: "1" };
      }
    });
  };
  render() {
    _logger("rendering");
    return (
      <div className="rag-fadeIn-enter-done">
        <div className="content-wrapper">
          <div className="row mb-2">
            <button
              className="btn btn-outline-primary"
              onClick={this.backCheckout}
              style={{ float: "left", bottm: "100%" }}
            >
              <i className="icon-arrow-left pr-1" />
              Return To Checkout
            </button>
          </div>
          <div className="row d-flex justify-content-center">
            <div className="card col-md-5">
              <div className="bb card-title pt-3">
                <h3 style={{ color: "#4696EC" }}>Register Card</h3>
              </div>
              <div className="card-body px-0">
                <p>Enter Card Info and Billing Details For Faster Checkouts</p>
              </div>
              <Accordion defaultActiveKey="0">
                <div className="card b mb-2">
                  <Accordion.Toggle
                    as={Card.Header}
                    eventKey={this.state.locationEventKey}
                  >
                    <h4 className="card-title">
                      <a style={{ color: "#4696EC" }}>1. Billing details</a>
                    </h4>
                  </Accordion.Toggle>
                  <Accordion.Collapse eventKey={this.state.locationEventKey}>
                    <div id="collapse01" className="card-body">
                      <div className="row">
                        <div className="col-lg-12">
                          <div className="card-body">
                            Please enter your Billing Information by clicking
                            the button below
                          </div>
                          {/* Start Location Code */}
                          <div className="text-center">
                            <button
                              className="btn btn-outline-primary"
                              onClick={this.toggleModal}
                            >
                              Add Location
                            </button>
                            {this.state.isOpen && (
                              <LocationsModal
                                onSaveAddress={this.onSaveAddress}
                                toggleModal={this.toggleModal}
                                locationId={this.state.formData.locationId}
                              />
                            )}
                          </div>

                          {this.state.locationData && (
                            <div className="col venueForm-locationIdField my-4">
                              <Label
                                className=" col-form-label"
                                style={{ color: "#161616" }}
                              >
                                <b>Location:</b>
                              </Label>
                              <div>
                                {this.state.locationData.lineOne}{" "}
                                {this.state.locationData.lineTwo}
                              </div>
                              <div>
                                {this.state.locationData.city},{" "}
                                {this.state.selectedState}{" "}
                                {this.state.locationData.zip}
                              </div>
                            </div>
                          )}
                          {/* End Location Code */}
                          <button
                            className="btn btn-outline-primary"
                            onClick={this.changeEventKey}
                            disabled={this.state.hasLocation === false}
                          >
                            Accept
                          </button>
                        </div>
                      </div>
                    </div>
                  </Accordion.Collapse>
                </div>
                <div className="card b mb-2">
                  <Accordion.Toggle
                    as={Card.Header}
                    eventKey={this.state.paymentEventKey}
                  >
                    <h4 className="card-title">
                      <a style={{ color: "#4696EC" }}>2. Card Info</a>
                    </h4>
                  </Accordion.Toggle>
                  <Accordion.Collapse eventKey={this.state.paymentEventKey}>
                    <div id="collapse01" className="card-body">
                      <div className="row">
                        <div className="col-lg-8">
                          {this.state.customerId.length &&
                            this.state.hasLocation && (
                              <RegisterCardForm
                                history={this.props.history}
                                customerId={this.state.customerId}
                                email={this.state.email}
                                locationData={this.state.locationData}
                                selectedState={this.state.selectedState}
                              />
                            )}
                        </div>
                      </div>
                    </div>
                  </Accordion.Collapse>
                </div>
              </Accordion>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
RegisterCard.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func,
  }),
  location: PropTypes.shape({
    state: PropTypes.shape({
      payload: PropTypes.shape({
        customerId: PropTypes.string,
        email: PropTypes.string,
      }),
    }),
  }),
};
export default RegisterCard;
