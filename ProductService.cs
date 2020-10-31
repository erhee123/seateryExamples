using Sabio.Data;
using Sabio.Data.Providers;
using Sabio.Models;
using Sabio.Models.Domain;
using Sabio.Models.Domain.LookUp;
using Sabio.Models.Requests;
using Sabio.Models.Requests.Products;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Data.SqlTypes;
using System.Linq;
using System.Runtime.InteropServices.ComTypes;
using System.Text;

namespace Sabio.Services
{
    public class ProductService : IProductService
    {
        IDataProvider _data = null;
        public ProductService(IDataProvider data)
        {
            _data = data;
        }

        public int Add(ProductAddRequest model, int userId)
        {
            int id = 0;

            string procName = "dbo.Products_SimpleInsert";
            _data.ExecuteNonQuery(procName,
               inputParamMapper: delegate (SqlParameterCollection col)
               {
                   AddCommonParams(model, col);
                   SqlParameter fileParam = new SqlParameter("@files", SqlDbType.Structured);
                   if (model.Files != null && model.Files.Any())
                   {
                       fileParam.Value = new IntIdTable(model.Files);
                   }
                   col.Add(fileParam);
                   SqlParameter idOut = new SqlParameter("@productId", SqlDbType.Int)
                   {
                       Direction = ParameterDirection.Output
                   };
                   col.Add(idOut);
                   col.AddWithValue("@createdBy", userId);
                   col.AddWithValue("@modifiedBy", userId);
                   
               },
               returnParameters: delegate (SqlParameterCollection returnCollection)
               {
                   object oId = returnCollection["@productId"].Value;

                   int.TryParse(oId.ToString(), out id);
               });

            return id;
        }
        public void Update(ProductUpdateRequest model, int userId)
        {
            string procName = "dbo.Products_SimpleUpdate";
            _data.ExecuteNonQuery(procName,
                inputParamMapper: delegate (SqlParameterCollection col)
                {
                    //SqlParameter fileParam = new SqlParameter("@files", SqlDbType.Structured);
                    //if (model.Files != null && model.Files.Any())
                    //{
                    //    fileParam.Value = new IntIdTable(model.Files);
                    //}
                    //col.Add(fileParam);

                    AddCommonParams(model, col);
                    col.AddWithValue("@productId", model.Id);
                    col.AddWithValue("@modifiedBy", userId);
                },
                returnParameters: null);
        }
        public void Delete(int id)
        {
            string procName = "dbo.Products_Delete_ById";

            _data.ExecuteNonQuery(procName,
                inputParamMapper: delegate (SqlParameterCollection col)
                {
                    col.AddWithValue("@productId", id);
                },
                returnParameters: null);

        }
        public Paged<Product> GetAll(int pageIndex, int pageSize)
        {
            Paged<Product> pagedResult = null;

            List<Product> list = null;

            int totalCount = 0;

            _data.ExecuteCmd(
             "dbo.Products_SelectAll_V2",
             inputParamMapper: delegate (SqlParameterCollection col)
             {
                 col.AddWithValue("@pageIndex", pageIndex);
                 col.AddWithValue("@pageSize", pageSize);
             },
             singleRecordMapper: delegate (IDataReader reader, short set)
             {
                 Product product = MapProduct(reader, out int startingIndex);


                 if (totalCount == 0)
                 {
                     totalCount = reader.GetSafeInt32(startingIndex++);
                 }


                 if (list == null)
                 {
                     list = new List<Product>();
                 }

                 list.Add(product);
             }

         );
            if (list != null)
            {
                pagedResult = new Paged<Product>(list, pageIndex, pageSize, totalCount);
            }

            return pagedResult;
        }
        public Product Get(int id)
        {
            string proc = "dbo.Products_Select_ById_V2";
            Product product = null;

            _data.ExecuteCmd(proc, delegate (SqlParameterCollection col)
            {
                col.AddWithValue("@productId", id);

            },
            delegate (IDataReader reader, short set) 
            {
                product = MapProduct(reader, out int startingIndex);
            }
            );

            return product;
        }
        public Paged<Product> GetByCreatedBy(int pageIndex, int pageSize, int userId)
        {
            Paged<Product> pagedResult = null;

            List<Product> list = null;

            int totalCount = 0;

            _data.ExecuteCmd(
             "dbo.Products_Select_ByCreatedBy_V2",
             inputParamMapper: delegate (SqlParameterCollection col)
             {
                 col.AddWithValue("@pageIndex", pageIndex);
                 col.AddWithValue("@pageSize", pageSize);
                 col.AddWithValue("@createdBy", userId);
             },
             singleRecordMapper: delegate (IDataReader reader, short set)
             {
                 Product product = MapProduct(reader, out int startingIndex);


                 if (totalCount == 0)
                 {
                     totalCount = reader.GetSafeInt32(startingIndex++);
                 }


                 if (list == null)
                 {
                     list = new List<Product>();
                 }

                 list.Add(product);
             }

         );
            if (list != null)
            {
                pagedResult = new Paged<Product>(list, pageIndex, pageSize, totalCount);
            }

            return pagedResult;
        }
        public Paged<Product> GetBySearch(int pageIndex, int pageSize, string query)
        {
            Paged<Product> pagedResult = null;

            List<Product> list = null;

            int totalCount = 0;

            _data.ExecuteCmd(
             "dbo.Products_Select_Product_BySearch",
             inputParamMapper: delegate (SqlParameterCollection col)
             {
                 col.AddWithValue("@pageIndex", pageIndex);
                 col.AddWithValue("@pageSize", pageSize);
                 col.AddWithValue("@query", query);
             },
             singleRecordMapper: delegate (IDataReader reader, short set)
             {
                 Product product = MapProduct(reader, out int startingIndex);

                 if (totalCount == 0)
                 {
                     totalCount = reader.GetSafeInt32(startingIndex++);
                 }


                 if (list == null)
                 {
                     list = new List<Product>();
                 }

                 list.Add(product);
             }

         );
            if (list != null)
            {
                pagedResult = new Paged<Product>(list, pageIndex, pageSize, totalCount);
            }

            return pagedResult;
        }
        public Paged<Product> GetByVendorAndProductType(int pageIndex, int pageSize, int vendorId, int typeId)
        {
            Paged<Product> pagedResult = null;

            List<Product> list = null;

            int totalCount = 0;

            _data.ExecuteCmd(
             "dbo.Products_Select_All_ByVendor_ProductType_V2",
             inputParamMapper: delegate (SqlParameterCollection col)
             {
                 col.AddWithValue("@pageIndex", pageIndex);
                 col.AddWithValue("@pageSize", pageSize);
                 col.AddWithValue("@vendorId", vendorId);
                 col.AddWithValue("@selectedProductTypeId", typeId);
             },
             singleRecordMapper: delegate (IDataReader reader, short set)
             {
                 Product product = MapProduct(reader, out int startingIndex);


                 if (totalCount == 0)
                 {
                     totalCount = reader.GetSafeInt32(startingIndex++);
                 }


                 if (list == null)
                 {
                     list = new List<Product>();
                 }

                 list.Add(product);
             }

         );
            if (list != null)
            {
                pagedResult = new Paged<Product>(list, pageIndex, pageSize, totalCount);
            }

            return pagedResult;
        }
        public Paged<Product> GetByVendor(int pageIndex, int pageSize, int vendorId)
        {
            Paged<Product> pagedResult = null;

            List<Product> list = null;

            int totalCount = 0;

            _data.ExecuteCmd(
             "dbo.Products_Select_All_Products_ByVendorId",
             inputParamMapper: delegate (SqlParameterCollection col)
             {
                 col.AddWithValue("@pageIndex", pageIndex);
                 col.AddWithValue("@pageSize", pageSize);
                 col.AddWithValue("@vendorId", vendorId);
             },
             singleRecordMapper: delegate (IDataReader reader, short set)
             {
                 Product product = MapProduct(reader, out int startingIndex);


                 if (totalCount == 0)
                 {
                     totalCount = reader.GetSafeInt32(startingIndex++);
                 }


                 if (list == null)
                 {
                     list = new List<Product>();
                 }

                 list.Add(product);
             }

         );
            if (list != null)
            {
                pagedResult = new Paged<Product>(list, pageIndex, pageSize, totalCount);
            }

            return pagedResult;
        }
        public Paged<Product> GetByType(int pageIndex, int pageSize, int typeId)
        {
            Paged<Product> pagedResult = null;

            List<Product> list = null;

            int totalCount = 0;

            _data.ExecuteCmd(
             "dbo.Products_Select_All_Products_ByType",
             inputParamMapper: delegate (SqlParameterCollection col)
             {
                 col.AddWithValue("@pageIndex", pageIndex);
                 col.AddWithValue("@pageSize", pageSize);
                 col.AddWithValue("@productTypeId", typeId);
             },
             singleRecordMapper: delegate (IDataReader reader, short set)
             {
                 Product product = MapProduct(reader, out int startingIndex);


                 if (totalCount == 0)
                 {
                     totalCount = reader.GetSafeInt32(startingIndex++);
                 }


                 if (list == null)
                 {
                     list = new List<Product>();
                 }

                 list.Add(product);
             }

         );
            if (list != null)
            {
                pagedResult = new Paged<Product>(list, pageIndex, pageSize, totalCount);
            }

            return pagedResult;
        }
        public Paged<Product> GetByVendorOrType(int pageIndex, int pageSize, int? vendorId, int? typeId)
        {
            Paged<Product> pagedResult = null;

            List<Product> list = null;

            int totalCount = 0;

            _data.ExecuteCmd(
             "dbo.Products_Select_All_Products_ByVendorId_or_TypeId",
             inputParamMapper: delegate (SqlParameterCollection col)
             {
                 col.AddWithValue("@pageIndex", pageIndex);
                 col.AddWithValue("@pageSize", pageSize);
                 col.AddWithValue("@vendorId", vendorId ?? null);
                 col.AddWithValue("@typeId", typeId ?? null);
             },
             singleRecordMapper: delegate (IDataReader reader, short set)
             {
                 Product product = MapProduct(reader, out int startingIndex);


                 if (totalCount == 0)
                 {
                     totalCount = reader.GetSafeInt32(startingIndex++);
                 }


                 if (list == null)
                 {
                     list = new List<Product>();
                 }

                 list.Add(product);
             }

         );
            if (list != null)
            {
                pagedResult = new Paged<Product>(list, pageIndex, pageSize, totalCount);
            }

            return pagedResult;
        }

        public Paged<Product> GetByVendorId(int pageIndex, int pageSize, int vendorId)
        {
            Paged<Product> pagedResult = null;
            List<Product> list = null;

            int totalCount = 0;

            string procName = "[dbo].[Products_Select_All_Products_ByVendorId]";

            _data.ExecuteCmd(procName,
             inputParamMapper: delegate (SqlParameterCollection col)
             {
                 col.AddWithValue("@pageIndex", pageIndex);
                 col.AddWithValue("@pageSize", pageSize);
                 col.AddWithValue("@vendorId", vendorId);
             },
             singleRecordMapper: delegate (IDataReader reader, short set)
             {
                 Product product = MapProduct(reader, out int startingIndex);


                 if (totalCount == 0)
                 {
                     totalCount = reader.GetSafeInt32(startingIndex++);
                 }


                 if (list == null)
                 {
                     list = new List<Product>();
                 }

                 list.Add(product);
             }

         );
            if (list != null)
            {
                pagedResult = new Paged<Product>(list, pageIndex, pageSize, totalCount);
            }

            return pagedResult;
        }
        public Product GetDetail(int id)
        {
            string proc = "dbo.Products_Select_Product_Details_ById";
            Product product = new Product();

            _data.ExecuteCmd(proc, delegate (SqlParameterCollection col)
            {
                col.AddWithValue("@productId", id);

            },
            delegate (IDataReader reader, short set)
            {
                int startingIndex = 0;
                product.TypeInfo = new ProductType();
                product.VendorInfo = new VendorBase();

                product.Id = reader.GetSafeInt32(startingIndex++);
                product.Name = reader.GetSafeString(startingIndex++);
                product.Description = reader.GetSafeString(startingIndex++);
                product.Cost = reader.GetSafeDecimal(startingIndex++);
                product.TypeInfo.Id = reader.GetSafeInt32(startingIndex++);
                product.TypeInfo.Name = reader.GetSafeString(startingIndex++);
                product.TypeInfo.Image = reader.GetSafeString(startingIndex++);
                product.TypeDescription = reader.GetSafeString(startingIndex++);
                product.VendorInfo.Id = reader.GetSafeInt32(startingIndex++);
                product.VendorInfo.Name = reader.GetSafeString(startingIndex++);
                product.VendorInfo.Headline = reader.GetSafeString(startingIndex++);
                product.VendorInfo.PrimaryImageUrl = reader.GetSafeString(startingIndex++);
                product.IsVisible = reader.GetSafeBool(startingIndex++);
                product.IsActive = reader.GetSafeBool(startingIndex++);
                product.Images = reader.DeserializeObject<List<Files>>(startingIndex++);
                product.CreatedBy = reader.GetSafeInt32(startingIndex++);
                product.ModifiedBy = reader.GetSafeInt32(startingIndex++);
                product.DateCreated = reader.GetSafeDateTime(startingIndex++);
                product.DateModified = reader.GetSafeDateTime(startingIndex++);

            }
            );

            return product;
        }
        private void AddCommonParams(ProductAddRequest model, SqlParameterCollection col)
        {
            col.AddWithValue("@name", model.Name);
            col.AddWithValue("@description", model.Description);
            col.AddWithValue("@cost", model.Cost);
            col.AddWithValue("@productTypeId", model.TypeId);
            col.AddWithValue("@vendorId", model.VendorId);
            col.AddWithValue("@isVisible", model.IsVisible);
            col.AddWithValue("@isActive", model.IsActive);
            col.AddWithValue("@productUrl", model.Url);
            col.AddWithValue("@fileTypeId", model.FileTypeId);
        }
        private static Product MapProduct(IDataReader reader, out int startingIndex)
        {
            Product product = new Product();
            product.TypeInfo = new ProductType();
            product.VendorInfo = new VendorBase();

            startingIndex = 0;

            product.Id = reader.GetSafeInt32(startingIndex++);
            product.Name = reader.GetSafeString(startingIndex++);
            product.Description = reader.GetSafeString(startingIndex++);
            product.Cost = reader.GetSafeDecimal(startingIndex++);
            product.TypeInfo.Id = reader.GetSafeInt32(startingIndex++);
            product.TypeInfo.Name = reader.GetSafeString(startingIndex++);
            product.TypeInfo.Image = reader.GetSafeString(startingIndex++);
            product.VendorInfo.Id = reader.GetSafeInt32(startingIndex++);
            product.VendorInfo.Name = reader.GetSafeString(startingIndex++);
            product.IsVisible = reader.GetSafeBool(startingIndex++);
            product.IsActive = reader.GetSafeBool(startingIndex++);
            product.Images = reader.DeserializeObject<List<Files>>(startingIndex++);
            product.CreatedBy = reader.GetSafeInt32(startingIndex++);
            product.ModifiedBy = reader.GetSafeInt32(startingIndex++);
            product.DateCreated = reader.GetSafeDateTime(startingIndex++);
            product.DateModified = reader.GetSafeDateTime(startingIndex++);

            return product;
        }

        public List<ProductType> GetAllTypes()
        {
            List<ProductType> list = null;

            string procName = "[dbo].[ProductType_SelectAll]";

            _data.ExecuteCmd(procName, inputParamMapper: null,
            singleRecordMapper: delegate (IDataReader reader, short set)
            {
                ProductType productType = new ProductType();

                int startingIndex = 0;

                productType.Id = reader.GetSafeInt32(startingIndex++);
                productType.Name = reader.GetSafeString(startingIndex++);
                productType.Description = reader.GetSafeString(startingIndex++);
                productType.Image = reader.GetSafeString(startingIndex++);

                if (list == null)
                {
                    list = new List<ProductType>();
                }

                list.Add(productType);
            }
            );

            return list;
        }

        public List<ProductType> GetTypeByVendorId(int vendorId)
        {
            List<ProductType> list = null;

            string procName = "[dbo].[Products_Select_ProductTypes_ByVendor]";

             _data.ExecuteCmd(procName, delegate (SqlParameterCollection col)
             {
                 col.AddWithValue("@vendorId", vendorId);
             },
            singleRecordMapper: delegate (IDataReader reader, short set)
            {
                ProductType productType = new ProductType();

                int startingIndex = 0;

                productType.Id = reader.GetSafeInt32(startingIndex++);
                productType.Name = reader.GetSafeString(startingIndex++);
                productType.Image = reader.GetSafeString(startingIndex++);

                if (list == null)
                {
                    list = new List<ProductType>();
                }

                list.Add(productType);
            }
            );

            return list;
        }
    }
}