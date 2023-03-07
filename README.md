# GameStore Server
    
   GameStore is a backend server using NodeJs, ExpressJs and Mongodb.

## Secuirty & Services

  ### APIs are secured with:
      1. Authorization.
      2. Authentication.
      3. Tokens with bearer key and expiry date.
      4. Validation.
      5. Passwords are hashed.
      6. Super admin to control the site.

  ### The server is supported with many services as:
      1. Pagination.
      2. Multer: upload images/videos to cloudinary.
      3. Social login.
      4. Confirm email before login.
      5. Global error handling to prevent failure of the server.

## Description

    - The server contains APIs: User, Genre, Game, Rate, Comment and Cart. 
    - User has activities and notifications.
    - User can follow others.
     
## Roles
  - Every role can perform all functionalities of below one.
  ### Superadmin
      (un)Block / (un)delete users, Remove comments, Add / remove roles.
      
  ### Admin
      Add / Remove games, Add / Remove genres.
      
  ### User
      See games, Add to cart, Wishlist, Rate games, Add comments on games.

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

Please make sure to update tests as appropriate.
