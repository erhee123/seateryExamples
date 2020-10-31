import React from "react";
import { Modal, ModalBody, Form, FormGroup, Label } from "reactstrap";
import PropTypes from "prop-types";
import stripeRegisterSchema from "./stripeRegisterSchema";
import { Formik, Field, ErrorMessage } from "formik";
import styles from "./checkout.module.css";
import logger from "sabio-debug";

const _logger = logger.extend("checkout");
const StripeRegisterModal = (props) => {
  const formData = props.formData;
  function handleSubmit(values) {
    props.handleSubmit(values);
    _logger("submitted");
  }
  return (
    <React.Fragment>
      <Modal isOpen={props.isOpen} toggle={props.toggleModal}>
        <ModalBody>
          <Formik
            enableReinitialize={true}
            validationSchema={stripeRegisterSchema}
            initialValues={formData}
            onSubmit={handleSubmit}
          >
            {(props) => {
              const { values, handleSubmit, isValid, isSubmitting } = props;
              return (
                <Form onSubmit={handleSubmit}>
                  <div className="card-title">
                    <h2 style={{ color: "#4696EC" }}>
                      Register Stripe Account
                    </h2>
                  </div>
                  <FormGroup>
                    <Label>Name</Label>
                    <Field
                      placeholder="Enter your full name"
                      type="text"
                      name="name"
                      autoComplete="off"
                      values={values.name}
                      className="form-control"
                    />
                    <ErrorMessage
                      component="span"
                      name="name"
                      className={styles.errorMessage}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Email</Label>
                    <Field
                      placeholder="Enter your email"
                      type="text"
                      name="email"
                      autoComplete="off"
                      values={values.email}
                      className="form-control"
                    />
                    <ErrorMessage
                      component="span"
                      name="email"
                      className={styles.errorMessage}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Phone Number</Label>
                    <Field
                      placeholder="Enter your phone number: ex. 7145323434"
                      type="text"
                      name="phone"
                      autoComplete="off"
                      values={values.phone}
                      className="form-control"
                    />
                    <ErrorMessage
                      component="span"
                      name="phone"
                      className={styles.errorMessage}
                    />
                  </FormGroup>
                  <button
                    type="submit"
                    style={{ width: "130px" }}
                    disabled={!isValid || isSubmitting}
                    className="btn btn-outline-primary btn-sm"
                  >
                    Submit
                  </button>
                </Form>
              );
            }}
          </Formik>
        </ModalBody>
      </Modal>
    </React.Fragment>
  );
};

StripeRegisterModal.propTypes = {
  values: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    phone: PropTypes.string,
  }),
  formData: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    phone: PropTypes.string,
  }),
  handleSubmitRegister: PropTypes.func,
  handleSubmit: PropTypes.func,
  isValid: PropTypes.bool,
  isSubmitting: PropTypes.bool,
  isOpen: PropTypes.bool,
  toggleModal: PropTypes.func,
  title: PropTypes.string,
  content: PropTypes.arrayOf([]),
};

export default StripeRegisterModal;
