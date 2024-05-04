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