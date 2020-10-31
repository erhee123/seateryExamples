import logger from "sabio-debug";
import React from "react";
import { NavLink, withRouter } from "react-router-dom";
import SingleProduct from "./SingleProduct";
import * as productService from "../../services/productService";
import PropTypes from "prop-types";
import Pagination from "rc-pagination";
import "rc-pagination/assets/index.css";
import locale from "rc-pagination/lib/locale/en_US";
import "simple-line-icons";
import styles from "./products.module.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import swal from "sweetalert";
import vendorServices from "../../services/vendorServices";


const _logger = logger.extend("Product");

class Products extends React.Component {
  state = {
    product: {
      id: "",
      name: "",
      description: "",
      cost: "",
      typeId: "",
      vendorId: "",
      isVisible: "",
      isActive: "",
      images: "",
      createdBy: "",
      modifiedBy: "",
      dateCreated: "",
      dateModified: "",
    },
    activePage: 1,
    totalCount: 0,
    searchBar: "",
    pageSize: 12,
    productType: "",
    selectedVendor: "",
    productTypesList: [],
  };
  componentDidMount() {
    this.getProductTypes();
    this.getAllVendors();
    this.getAllProductsPaged(this.state.activePage);
  }

  getAllProductsPaged = (page) => {
    productService
      .getAllProducts(page - 1, this.state.pageSize)
      .then(this.onGetAllSuccess)
      .catch(this.onGetAllFailure);
  };
  getAllProductsByUser = (page) => {
    productService
      .getProductsByUser(page - 1, this.state.pageSize)
      .then(this.onGetAllSuccess)
      .catch(this.onGetAllFailure);
  };
  onGetAllSuccess = (response) => {
    var productList = response.data.item.pagedItems;
    var totalCount = response.data.item.totalCount;
    _logger(productList);
    this.setState(() => {
      return {
        mappedProducts: productList.map(this.mapProducts),
        totalCount,
      };
    });
  };
  onGetAllFailure = (response) => {
    _logger(response);
    toast.error("No records found");
  };
  getProductsByTypeOrVendor = (page) => {
    productService
      .getAllProductsByTypeOrVendor(
        page - 1,
        this.state.pageSize,
        this.state.selectedVendor,
        this.state.productType
      )
      .then(this.onGetAllSuccess)
      .catch(this.onGetAllByTypeFailure);
  };
  onGetAllByTypeFailure = (response) => {
    _logger(response);
    toast.error("No matches found");
    this.getAllProductsPaged(1);
  };
  onTypeFilter = (e) => {
    let currentTarget = e.currentTarget;
    let newValue = currentTarget.value;
    this.setState(
      () => {
        if (Number(newValue) === 0) {
          return { productType: "", activePage: 1 };
        } else {
          return { productType: Number(newValue), activePage: 1 };
        }
      },
      () =>
        this.state.productType === null
          ? this.getAllProductsPaged(1)
          : this.getProductsByTypeOrVendor(1)
    );
  };
  onVendorFilter = (e) => {
    let currentTarget = e.currentTarget;
    let newValue = currentTarget.value;
    this.setState(
      () => {
        if (Number(newValue) === 0) {
          return { selectedVendor: "", activePage: 1 };
        } else {
          return { selectedVendor: Number(newValue), activePage: 1 };
        }
      },
      () =>
        this.state.selectedVendor === null
          ? this.getAllProductsPaged(1)
          : this.getProductsByTypeOrVendor(1)
    );
  };
  mapProducts = (product) => {
    return (
      <React.Fragment key={`Product-${product.id}`}>
        <SingleProduct
          product={product}
          editProduct={this.onClickEdit}
          deleteProduct={this.onClickDelete}
          showDetails={this.onClickShowDetails}
        ></SingleProduct>
      </React.Fragment>
    );
  };
  onChange = (page) => {
    if (this.state.searchBar.length > 0) {
      this.setState(
        () => {
          return { activePage: page };
        },
        () => this.searchResults(this.state.activePage)
      );
    } else {
      this.setState(
        () => {
          return { activePage: page };
        },
        () =>
          this.state.productType > 0
            ? this.getProductsByType(this.state.activePage)
            : this.getAllProductsPaged(this.state.activePage)
      );
    }
  };
  onFormFieldChanged = (e) => {
    let currentTarget = e.currentTarget;
    let newValue = currentTarget.value;
    this.setState(
      () => {
        return { searchBar: newValue, activePage: 1 };
      },
      () =>
        this.state.searchBar.length > 0
          ? this.searchResults(1)
          : this.getAllProductsPaged(1)
    );
  };
  searchResults = (page) => {
    let query = this.state.searchBar;
    productService
      .searchByNameDescType(page - 1, this.state.pageSize, query)
      .then(this.onGetAllSuccess)
      .catch(this.onSearchFailure);
  };

  onSearchFailure = (errResponse) => {
    _logger(errResponse, "no records found");
    this.setState(() => {
      return {
        mappedProducts: [],
        totalCount: 0,
      };
    });
  };
  onClickShowDetails = (product) => {
    var selectedProduct = { type: "PRODUCT_TO_SHOW", payload: product };
    this.props.history.push("products/details/" + product.id, selectedProduct);
  };
  onClickDelete = (product) => {
    _logger(product);
    let productId = product.id;
    swal({
      title: "Are you sure?",
      text: "Once deleted the product can not be recovered",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        productService
          .deleteProduct(productId)
          .then(this.onDeleteSuccess)
          .catch(this.onDeleteFailure);
      } else {
        swal("Product not deleted!");
      }
    });
  };
  onDeleteSuccess = (productId) => {
    this.setState((prevState) => {
      const deletedProduct = (element) =>
        element.props.children.props.product.id === productId;
      const indexOfProducts = this.state.mappedProducts.findIndex(
        deletedProduct
      );
      const updatedProducts = [...prevState.mappedProducts];
      if (indexOfProducts >= 0) {
        updatedProducts.splice(indexOfProducts, 1);
      }
      return {
        mappedProducts: updatedProducts,
      };
    });
    swal("Your product has been deleted!", {
      icon: "success",
    });
  };
  onDeleteFailure = (errResponse) => {
    _logger(errResponse);
  };

  onClickEdit = (product) => {
    var selectedProduct = { type: "PRODUCT_TO_EDIT", payload: product };
    this.props.history.push("products/edit/" + product.id, selectedProduct);
    _logger(product, "Edit this product");
  };
  getProductTypes = () => {
    productService
      .getProductTypes()
      .then(this.onGetTypeSuccess)
      .catch(this.onGetTypeFailure);
  };
  onGetTypeSuccess = (response) => {
    const prodTypeData = response.data.items;
    const mappedProductTypes = prodTypeData.map((productType) => {
      return { Id: productType.id, Name: productType.name };
    });
    this.setState(() => {
      return {
        productTypeOptions: mappedProductTypes.map(this.mapOptions),
      };
    });
  };
  onGetTypeFailure = (response) => {
    _logger(response);
    toast.error("No product types found");
  };
  getAllVendors = () => {
    vendorServices
      .getVendors(0, 100) //this is a paginated get all but i dont need pagination for vendor mapping
      .then(this.onSuccessVendors)
      .catch(this.onErrorVendors);
  };
  onSuccessVendors = (response) => {
    const vendors = response.data.item.pagedItems;
    const mappedVendors = vendors.map((vendor) => {
      return { Id: vendor.id, Name: vendor.name };
    });
    this.setState(() => {
      return {
        vendorList: mappedVendors.map(this.mapOptions),
      };
    });
  };
  onErrorVendors = (response) => {
    _logger(response);
    toast.error("No vendors found");
  };
  onPageSizeChange = (e) => {
    let currentTarget = e.currentTarget;
    let newValue = currentTarget.value;
    this.setState(
      () => {
        return { pageSize: Number(newValue) };
      },
      () =>
        this.state.productType > 0
          ? this.getProductsByType(1)
          : this.getAllProductsPaged(1)
    );
  };
  onAddProduct = (e) => {
    e.preventDefault();
    this.props.history.push("/products/new");
  };
  mapOptions = (input) => {
    return (
      <option key={input.Id} value={input.Id}>
        {input.Name}
      </option>
    );
  };

  render() {
    _logger("rendering");

    return (
      <div className="rag-fadeIn-enter-done">
        <div className="content-wrapper">
          <div className="col-sm-12 col-md-12" style={{ height: "20px" }}>
            <div
              className={`${styles.titleHeader}`}
              style={{ fontSize: "15px", float: "right" }}
            >
              <div className="row" aria-label="breadcrumb">
                <NavLink className="" to="/">
                  Home
                </NavLink>
                <NavLink className="" to="/products">
                  /Products
                </NavLink>
              </div>
            </div>
          </div>
          <div className={styles.productWrapper}>
            <div className={`${styles.productFilter} row`}>
              <div className="col-sm-12 col-md-12 py-2">
                <div
                  className="row"
                  style={{
                    float: "left",
                    width: "50%",
                  }}
                >
                  <label className="px-1 col-sm-12 col-md-3">
                    <button
                      className="btn btn-outline-primary"
                      onClick={this.onAddProduct}
                      style={{ width: "150px", height: "30.99px" }}
                    >
                      Add Products
                    </button>
                  </label>
                  <label className="px-1 col-md-3">
                    <select
                      name="dropdownMenu pageSize"
                      className="custom-select custom-select-sm form-control form-control-sm"
                      value={this.state.pageSize}
                      onChange={this.onPageSizeChange}
                    >
                      <option value={12}>Items Per Page</option>
                      <option value={3}>3</option>
                      <option value={12}>12</option>
                      <option value={24}>24</option>
                      <option value={48}>48</option>
                      <option value={100}>100</option>
                    </select>
                  </label>
                  <label className="px-1 col-md-3">
                    <select
                      name="dropdownMenu productType"
                      className="custom-select custom-select-sm form-control form-control-sm"
                      value={this.state.productType}
                      onChange={this.onTypeFilter}
                    >
                      <option value={""}>All Product Types</option>
                      {this.state.productTypeOptions}
                    </select>
                  </label>
                  <label className="px-1 col-md-3">
                    <select
                      name="dropdownMenu vendors"
                      className="custom-select custom-select-sm form-control form-control-sm"
                      value={this.state.selectedVendor}
                      onChange={this.onVendorFilter}
                    >
                      <option value={""}>All Vendors</option>
                      {this.state.vendorList}
                    </select>
                  </label>
                </div>
                <div className="search row" style={{ float: "right" }}>
                  <i
                    className="icon-magnifier"
                    style={{ paddingTop: "10px", paddingRight: "5px" }}
                  ></i>
                  <label>
                    <input
                      id="searchBar"
                      type="search"
                      className="form-control form-control-sm"
                      placeholder="Name, Description or Type"
                      value={this.state.searchBar}
                      onChange={this.onFormFieldChanged}
                    ></input>
                  </label>
                </div>
              </div>
            </div>
            <div
              className="row justify-content-space-evenly"
              style={{
                paddingLeft: "-10px",
              }}
            >
              {this.state.mappedProducts}
            </div>
            <div className="row">
              <div className="col-sm-12 col-md-6 ">
                <div className="info" role="status">
                  Total of {this.state.totalCount} entries
                </div>
              </div>
              <div className="col-sm-12 col-md-6">
                <Pagination
                  style={{ float: "right" }}
                  locale={locale}
                  onChange={this.onChange}
                  pageSize={this.state.pageSize}
                  current={this.state.activePage}
                  total={this.state.totalCount}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
Products.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func,
  }),

};

export default withRouter(Products);
