# Requirements about blog post project :

## Service in Microservices :

🔴 ⇒ Important , 🟣 ⇒ less important 

- User service 🔴
- Post service 🔴
- Comment service🔴
- Bookmark service 🔴
- search service 🟣
- notification service 🟣

## Function Requirements and Business logic :

1. **User Service:**
    - **User Authentication:**
        - Implement user registration
        - Provide login functionality with authentication tokens.
        - Support password reset functionality.
    - **Profile Management:**
        - Enable users to update their profile information (e.g., name, email, profile picture).
        - Allow users to change their passwords securely.
    - **Follow :**
        - Allow users to follow each others

**2- Post Service:**

- **Post Management:**
    - Allow users to create, edit, and delete blog posts.
    - Implement validation to ensure that required fields are provided when creating or editing posts.
    - Handles operations related to posts such as  commenting, and liking/disliking.
- **Content Formatting:**
    - Enable users to add images to their posts.
- **Categorization and Tagging:**
    - Enable users to categorize posts into different topics or categories.
    - Allow users to add tags to posts for better organization and searchability.

**3- Comment Service**:

- Focuses specifically on managing comments on blog posts.
- Enable users to add , edit, delete comments to blog posts.
- Implement validation to prevent empty or malicious comments.
- Handles operations related to commenting, replying to comments, and managing comment threads.

**4 - Bookmark Service:**

- **Bookmark Management:**
    - Enable users to bookmark or save posts for later viewing.
    - Allow users to view their list of bookmarked posts and remove bookmarks when desired.

**5 - Search Service:**

- **Search Functionality:**
    - Implement search functionality to allow users to find posts based on keywords, categories, tags, etc.
    - Ensure fast and accurate search results by indexing posts and implementing efficient search algorithms.

**6 - Notification Service:**

- **Notification Delivery:**
    - Send notifications to users for relevant events such as new comments on their posts or mentions.
    - Provide options for users to manage their notification preferences (e.g., email notifications, push notifications).

# MVP RoadMap 👨‍🏫 :

### **MVP Roadmap:**

### **Phase 0 : Analysis and Design (Week 1)**
- Analysis business & function Requirements 
- system Design
- Database Design
    - Charts and Diagrams
    - Data model and schema design

### **Phase 1: User Management**

1. **User Authentication (Week 1)**
    - Implement user registration and login functionality.
    - Generate authentication tokens upon successful login.
2. **Profile Management (Week 2)**
    - Allow users to update their profile information.
    - Implement basic validation for profile updates.

### **Phase 2: Post Management**

1. **Post Creation and Viewing (Week 3)**
    - Enable users to create new blog posts.
    - Implement basic post viewing functionality.
2. **Basic Formatting (Week 4)**
    - Add support for basic text formatting options (e.g., bold, italic).
    - Allow users to save and edit formatted content.

### **Phase 3: Interaction Features**

1. **Commenting System (Week 5)**
    - Implement basic commenting functionality for blog posts.
    - Allow users to view and post comments.
2. **Bookmarking (Week 6)**
    - Enable users to bookmark posts for later viewing.
    - Provide a simple interface for managing bookmarks.

### **Phase 4: Advanced Features**

1. **Search Functionality (Week 7)**
    - Implement basic search functionality for finding posts by title or content.
    - Allow users to search for posts using keywords.
2. **Notification System (Week 8)**
    - Implement basic notifications for new comments or mentions.
    - Provide options for users to manage notification preferences.

### **Phase 5: Quality Assurance and Deployment**

1. **Testing and Bug Fixes (Week 9)**
    - Conduct thorough testing of all implemented features.
    - Address any bugs or issues identified during testing.
2. **Deployment (Week 10)**
    - Deploy the MVP to a staging environment for user testing.
    - Gather feedback from early users and stakeholders.

### **Post-MVP Considerations:**

- Enhance text formatting options (e.g., headings, lists, hyperlinks).
- Implement more advanced features such as threaded comments and media embedding.
- Improve search functionality with filters and sorting options.
- Enhance the notification system with additional event triggers and delivery channels.

# Project Features as API 🍝

### **User Service API:**

1. **User Authentication:**
    - **`/api/auth/register`**: Endpoint for user registration.
    - **`/api/auth/login`**: Endpoint for user login to obtain authentication tokens.
    - **`/api/auth/logout`**: Endpoint for user logout and token invalidation.
    - **`/api/auth/reset-password`**: Endpoint for resetting user passwords.
2. **Profile Management:**
    - **`/api/users/{userId}`**:
        - **`GET`**: Retrieve user profile information.
        - **`PUT`**: Update user profile information.

### **Post Service API:**

1. **Post Management:**
    - **`/api/posts`**:
        - **`GET`**: Retrieve a list of all blog posts.
        - **`POST`**: Create a new blog post.
    - **`/api/posts/{postId}`**:
        - **`GET`**: Retrieve a specific blog post.
        - **`PUT`**: Update a blog post.
        - **`DELETE`**: Delete a blog post.
2. **Comment Service API:**
    - **`/api/posts/{postId}/comments`**:
        - **`GET`**: Retrieve comments for a specific blog post.
        - **`POST`**: Add a new comment to a blog post.
    - **`/api/comments/{commentId}`**:
        - **`GET`**: Retrieve a specific comment.
        - **`PUT`**: Update a comment.
        - **`DELETE`**: Delete a comment.
3. **Bookmark Service API:**
    - **`/api/bookmarks`**:
        - **`GET`**: Retrieve all bookmarks for the authenticated user.
        - **`POST`**: Add a new bookmark for a specific post.
    - **`/api/bookmarks/{bookmarkId}`**:
        - **`DELETE`**: Remove a bookmark.
4. **Search Service API:**
    - **`/api/search`**:
        - **`GET`**: Search for blog posts based on keywords, categories, tags, etc.
5. **Notification Service API:**
    - **`/api/notifications`**:
        - **`GET`**: Retrieve all notifications for the authenticated user.
        - **`PUT`**: Update notification preferences.
        - **`DELETE`**: Clear notifications.
6. **Analytics Service API:**
    - **`/api/analytics`**:
        - **`GET`**: Retrieve analytics data such as user engagement metrics, popular posts, etc.
7. **Gateway Service API:**
    - **`/api`**: Gateway endpoint for routing requests to appropriate microservices.
    - **`/api-docs`**: Swagger documentation for API endpoints.
8. **Media Service API:**
    - **`/api/media/upload`**: Endpoint for uploading images and videos.
    - **`/api/media/{mediaId}`**:
        - **`GET`**: Retrieve a specific media file.
        - **`DELETE`**: Delete a media file.