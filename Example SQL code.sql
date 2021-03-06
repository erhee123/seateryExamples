USE [C91_Seatery]
GO
/****** Object:  Table [dbo].[Products]    Script Date: 10/31/2020 2:38:20 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Products](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Name] [nvarchar](255) NOT NULL,
	[Description] [nvarchar](4000) NOT NULL,
	[Cost] [decimal](18, 2) NOT NULL,
	[ProductTypeId] [int] NOT NULL,
	[VendorId] [int] NOT NULL,
	[IsVisible] [bit] NOT NULL,
	[IsActive] [bit] NOT NULL,
	[CreatedBy] [int] NOT NULL,
	[ModifiedBy] [int] NOT NULL,
	[DateCreated] [datetime2](7) NOT NULL,
	[DateModified] [datetime2](7) NOT NULL,
 CONSTRAINT [PK_Products] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ShoppingCart]    Script Date: 10/31/2020 2:38:20 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ShoppingCart](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[ProductId] [int] NOT NULL,
	[Quantity] [int] NOT NULL,
	[DateAdded] [datetime2](7) NOT NULL,
	[DateModified] [datetime2](7) NOT NULL,
	[CreatedBy] [int] NOT NULL,
	[ModifiedBy] [int] NOT NULL,
	[SpecialRequests] [nvarchar](150) NULL,
 CONSTRAINT [PK_ShoppingCart] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[Products] ADD  CONSTRAINT [DF_Products_DateCreated]  DEFAULT (getutcdate()) FOR [DateCreated]
GO
ALTER TABLE [dbo].[Products] ADD  CONSTRAINT [DF_Products_DateModified]  DEFAULT (getutcdate()) FOR [DateModified]
GO
ALTER TABLE [dbo].[ShoppingCart] ADD  CONSTRAINT [DF_ShoppingCart_DateAdded]  DEFAULT (getutcdate()) FOR [DateAdded]
GO
ALTER TABLE [dbo].[ShoppingCart] ADD  CONSTRAINT [DF_ShoppingCart_DateModified]  DEFAULT (getutcdate()) FOR [DateModified]
GO
ALTER TABLE [dbo].[Products]  WITH CHECK ADD  CONSTRAINT [FK_Products_CreatedBy_Users] FOREIGN KEY([CreatedBy])
REFERENCES [dbo].[Users] ([Id])
GO
ALTER TABLE [dbo].[Products] CHECK CONSTRAINT [FK_Products_CreatedBy_Users]
GO
ALTER TABLE [dbo].[Products]  WITH CHECK ADD  CONSTRAINT [FK_Products_ModifiedBy_Users] FOREIGN KEY([ModifiedBy])
REFERENCES [dbo].[Users] ([Id])
GO
ALTER TABLE [dbo].[Products] CHECK CONSTRAINT [FK_Products_ModifiedBy_Users]
GO
ALTER TABLE [dbo].[Products]  WITH CHECK ADD  CONSTRAINT [FK_Products_ProductType] FOREIGN KEY([ProductTypeId])
REFERENCES [dbo].[ProductType] ([Id])
GO
ALTER TABLE [dbo].[Products] CHECK CONSTRAINT [FK_Products_ProductType]
GO
ALTER TABLE [dbo].[Products]  WITH CHECK ADD  CONSTRAINT [FK_Products_Vendors] FOREIGN KEY([VendorId])
REFERENCES [dbo].[Vendors] ([Id])
GO
ALTER TABLE [dbo].[Products] CHECK CONSTRAINT [FK_Products_Vendors]
GO
ALTER TABLE [dbo].[ShoppingCart]  WITH CHECK ADD  CONSTRAINT [FK_ShoppingCart_CreatedBy_Users] FOREIGN KEY([CreatedBy])
REFERENCES [dbo].[Users] ([Id])
GO
ALTER TABLE [dbo].[ShoppingCart] CHECK CONSTRAINT [FK_ShoppingCart_CreatedBy_Users]
GO
ALTER TABLE [dbo].[ShoppingCart]  WITH CHECK ADD  CONSTRAINT [FK_ShoppingCart_ModifiedBy_Users] FOREIGN KEY([ModifiedBy])
REFERENCES [dbo].[Users] ([Id])
GO
ALTER TABLE [dbo].[ShoppingCart] CHECK CONSTRAINT [FK_ShoppingCart_ModifiedBy_Users]
GO
ALTER TABLE [dbo].[ShoppingCart]  WITH CHECK ADD  CONSTRAINT [FK_ShoppingCart_Products] FOREIGN KEY([ProductId])
REFERENCES [dbo].[Products] ([Id])
GO
ALTER TABLE [dbo].[ShoppingCart] CHECK CONSTRAINT [FK_ShoppingCart_Products]
GO
/****** Object:  StoredProcedure [dbo].[Products_Insert]    Script Date: 10/31/2020 2:38:20 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO



CREATE proc [dbo].[Products_Insert]
	
						@Name nvarchar(255)
						,@Description nvarchar(4000)
						,@Cost decimal(18, 2)
						,@ProductTypeId int
						,@VendorId int
						,@IsVisible bit
						,@IsActive bit
						,@CreatedBy int
						,@ModifiedBy int
						,@ProductId int OUTPUT
						,@files as dbo.FileId READONLY

/**
	DECLARE @files dbo.FileId
	DECLARE @_ProductId int = 3;
	DECLARE @fileId int = 0;

	DECLARE					@_Name nvarchar(255) = 'McGriddle'
							,@_Description nvarchar(4000) = 'Some tasty ish'
							,@_cost decimal(18,2) = 21.00
							,@_ProductTypeId int = 3
							,@_VendorId int = 1
							,@_IsVisible bit = 1
							,@_IsActive bit = 1
							,@_CreatedBy int = 4
							,@_ModifiedBy int = 4
	INSERT INTO @files (FileId)
	Values (3)


	EXECUTE dbo.Products_Insert
							
							@_Name
							,@_Description
							,@_cost
							,@_ProductTypeId
							,@_VendorId
							,@_IsVisible
							,@_IsActive
							,@_CreatedBy
							,@_ModifiedBy
							,@_ProductId OUTPUT
							,@files


	SELECT *
	FROM dbo.Products
	WHERE Id = @_ProductId

	SELECT *
	FROM dbo.ProductImages_Composite


*/
as

BEGIN
	
INSERT INTO [dbo].[Products]
           ([Name]
           ,[Description]
		   ,[Cost]
           ,[ProductTypeId]
           ,[VendorId]
           ,[IsVisible]
           ,[IsActive]
           ,[CreatedBy]
           ,[ModifiedBy])
     VALUES
           (@Name
           ,@Description
		   ,@Cost
		   ,@ProductTypeId
           ,@VendorId
           ,@IsVisible
           ,@IsActive
           ,@CreatedBy
           ,@ModifiedBy);

	SET @ProductId = SCOPE_IDENTITY();


	execute dbo.ProductImages_Composite_Insert
				@productId 
				,@files 
	

END

GO
/****** Object:  StoredProcedure [dbo].[Products_Select_All_Products_ByVendorId_or_TypeId]    Script Date: 10/31/2020 2:38:20 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO



CREATE proc [dbo].[Products_Select_All_Products_ByVendorId_or_TypeId]
								 @vendorId int = null
								 ,@typeId int = null
								,@pageIndex int
								,@pageSize int

as

/*

	Declare 
			@vendorId int = 1
			,@typeId int = 3
		   ,@_pageIndex int = 0
		   ,@_pageSize int = 12


	Execute dbo.Products_Select_All_Products_ByVendorId_or_TypeId
			 @vendorId
			 ,null
			,@_pageIndex 
			,@_pageSize 

*/


BEGIN

Declare @offset int = @pageIndex * @pageSize

	SELECT p.Id
		  ,p.[Name]
		  ,p.[Description]
		  ,p.[Cost]
		  ,pt.Id as ProductTypeId
		  ,pt.Name as ProductType
		  ,pt.Image as TypeImage
		  ,p.[VendorId]
		  ,v.Name as VendorName
		  ,p.[IsVisible]
		  ,p.[IsActive]
		  ,Images = (
					Select f.Id
						,f.FileTypeId
						,f.Url
					From dbo.Files as f inner join dbo.ProductImages_Composite as pic
							on f.Id = pic.FileId
							where pic.ProductId = p.Id
					FOR JSON AUTO
					)
		  ,p.[CreatedBy]
		  ,p.[ModifiedBy]
		  ,p.[DateCreated]
		  ,p.[DateModified]
		  ,TotalCount = COUNT(1) over()

	  FROM [dbo].[Products] as p inner join dbo.Vendors as v
			on v.Id = p.VendorId
			inner join dbo.ProductType as pt
			on p.ProductTypeId = pt.Id
	  WHERE p.VendorId = case 
								when @vendorId is not null then @vendorId
								else p.VendorId
						 END
	  AND p.ProductTypeId = case
								when @typeId is not null then @typeId
								else p.ProductTypeId
							END
	  Order By p.Id



	  OFFSET @offset Rows
	  Fetch Next @pageSize Rows ONLY

END
GO
/****** Object:  StoredProcedure [dbo].[ShoppingCart_MultiInsertV2]    Script Date: 10/31/2020 2:38:20 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO



CREATE proc [dbo].[ShoppingCart_MultiInsertV2]
		@cartId INT OUTPUT
		,@createdBy INT
		,@modifiedBy INT
		,@cartItems as dbo.CartItemsV2 READONLY

AS

/*-----------TEST CODE-------------
DECLARE @cartItems as dbo.CartItemsV2
DECLARE @_cartId INT = 0 

DECLARE @_createdBy INT = 3
		,@_modifiedBy INT = 3

INSERT INTO @cartItems (ProductId, Quantity, SpecialRequests)
VALUES (10, 2, 'no cheese'), (3, 4, null), (4,3, 'extra lettuce')

EXEC dbo.ShoppingCart_MultiInsertV2
		@_cartId OUTPUT
		,@_createdBy
		,@_modifiedBy
		,@cartItems

SELECT *
FROM dbo.ShoppingCart



*/

BEGIN
	Delete From dbo.ShoppingCart
	WHere CreatedBy = @createdBy

	Insert into dbo.ShoppingCart(
				[ProductId],
				[Quantity],
				[CreatedBy],
				[ModifiedBy],
				[SpecialRequests])
	Select ci.ProductId
			,ci.Quantity
			,@createdBy
			,@modifiedBy
			,ci.SpecialRequests
	From @cartItems as ci
	SET @cartId = SCOPE_IDENTITY();

END	
GO
