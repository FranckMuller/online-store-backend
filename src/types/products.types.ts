export type TSortProducts = {
  createdAt?: 1 | -1;
  price?: 1 | -1;
};

export enum ProductFields {
  _Id = "_id",
  Id = "id",
  Name = "name",
  Description = "description",
  Price = "price",
  Images = "images",
  MainImage = "mainImage",
  Published = "published",
  Reviews = "reviews"
}
