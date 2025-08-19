# Error Handling System Documentation

## Overview
This document explains how the error handling system works in the TaskPortals backend application. It's a well-structured, layered approach that provides consistent error responses and automatic error handling.

## Architecture Flow

### 1. **Error Occurs in Controller**
```typescript
// In your controller (wrapped by asyncHandler)
const getUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND'); // Custom error
    }
    res.json(user);
});
```

### 2. **asyncHandler Catches the Error**
```typescript
// From the asyncHandler middleware
export const asyncHandler = (controller: AsynControllerType) => {
    return async (req, res, next) => {
        try {
            await controller(req, res, next);
        } catch(error) {
            next(error); // Passes error to Express error handling
        }
    }
}
```

### 3. **Express Routes Error to errorHandler**
Express automatically calls the error handler middleware when `next(error)` is called.

### 4. **errorHandler Processes the Error**
```typescript
export const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
    console.error(`Error occured on path: ${req.path}`, error);
    
    // Handle different error types...
}
```

## Error Types & Responses

### **1. Syntax Errors (Invalid JSON)**
```typescript
if (error instanceof SyntaxError) {
    return res.status(400).json({
        message: "Invalid JSON format. Please check your request body."
    });
}
```

### **2. Custom App Errors**
```typescript
if (error instanceof AppError) {
    return res.status(error.statusCode).json({
        message: error.message,
        errorCode: error.errorCode
    });
}
```

### **3. Generic Errors**
```typescript
return res.status(500).json({
    message: "Internal server error",
    error: error?.message || "Something went wrong"
});
```

## Custom Error Classes

### **Base AppError Class**
```typescript
export class AppError extends Error {
  public statusCode: HttpStatusCodeType;
  public errorCode?: ErrorCodeEnumType;

  constructor(
    message: string,
    statusCode = HTTPSTATUS.INTERNAL_SERVER_ERROR,
    errorCode?: ErrorCodeEnumType
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    Error.captureStackTrace(this, this.constructor);
  }
}
```

### **Pre-built Exception Classes**
```typescript
// Use these for common error scenarios
throw new NotFoundException('User not found');
throw new BadRequestException('Invalid input');
throw new UnauthorizedException('Login required');
throw new InternalServerException('Database connection failed');

// Or create custom ones
throw new AppError('Custom message', 409, 'CUSTOM_ERROR_CODE');
```

## Error Code Enumeration

```typescript
export const ErrorCodeEnum = {
    AUTH_EMAIL_ALREADY_EXISTS: "AUTH_EMAIL_ALREADY_EXISTS",
    AUTH_INVALID_TOKEN: "AUTH_INVALID_TOKEN",
    AUTH_USER_NOT_FOUND: "AUTH_USER_NOT_FOUND",
    AUTH_NOT_FOUND: "AUTH_NOT_FOUND",
    AUTH_TOO_MANY_ATTEMPTS: "AUTH_TOO_MANY_ATTEMPTS",
    AUTH_UNAUTHORIZED_ACCESS: "AUTH_UNAUTHORIZED_ACCESS",
    AUTH_TOKEN_NOT_FOUND: "AUTH_TOKEN_NOT_FOUND",
    ACCESS_UNAUTHOIZED: "ACCESS_UNAUTHOIZED",
    VALIDATION_ERROR: "VALIDATION_ERROR",
    RESOURCE_NOT_FOUND: "RESOURCE_NOT_FOUND",
    INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
} as const;
```

## Complete Example

### **Controller Implementation**
```typescript
const createUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
        throw new BadRequestException('Email and password are required');
    }
    
    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new AppError('Email already exists', 409, 'AUTH_EMAIL_ALREADY_EXISTS');
    }
    
    // Create user logic
    const user = await User.create({ email, password });
    res.status(201).json(user);
});
```

### **Error Flow**
1. **Error occurs** in controller (e.g., validation fails)
2. **asyncHandler catches** the thrown error
3. **Passes to next(error)** which routes to Express error handling
4. **errorHandler processes** the error and sends appropriate response
5. **Client receives** structured error response

## Response Examples

### **Bad Request (400)**
```json
{
    "message": "Email and password are required",
    "errorCode": "VALIDATION_ERROR"
}
```

### **Not Found (404)**
```json
{
    "message": "User not found",
    "errorCode": "RESOURCE_NOT_FOUND"
}
```

### **Conflict (409)**
```json
{
    "message": "Email already exists",
    "errorCode": "AUTH_EMAIL_ALREADY_EXISTS"
}
```

### **Internal Server Error (500)**
```json
{
    "message": "Internal server error",
    "error": "Database connection failed"
}
```

## Benefits

1. **Consistent Error Responses** - All errors follow the same format
2. **Type Safety** - TypeScript ensures valid error codes and status codes
3. **Centralized Handling** - All errors go through one place
4. **Clean Controllers** - No try-catch blocks needed
5. **Structured Error Codes** - Frontend can handle specific error types
6. **Automatic Logging** - All errors are logged with request path
7. **Maintainable** - Easy to add new error types and codes

## Best Practices

1. **Use specific exception classes** when possible (NotFoundException, BadRequestException, etc.)
2. **Provide meaningful error messages** that help developers and users
3. **Use appropriate HTTP status codes** for different error types
4. **Include error codes** for frontend error handling
5. **Log errors** with sufficient context for debugging
6. **Don't expose sensitive information** in error messages

## Adding New Error Types

To add a new error type:

1. **Add to ErrorCodeEnum:**
```typescript
export const ErrorCodeEnum = {
    // ... existing codes
    NEW_ERROR_TYPE: "NEW_ERROR_TYPE",
} as const;
```

2. **Create custom exception class (optional):**
```typescript
export class NewException extends AppError {
    constructor(message = "New error occurred", errorCode?: ErrorCodeEnumType) {
        super(message, HTTPSTATUS.BAD_REQUEST, errorCode || ErrorCodeEnum.NEW_ERROR_TYPE);
    }
}
```

3. **Use in controllers:**
```typescript
throw new NewException('Custom message');
// or
throw new AppError('Custom message', 400, 'NEW_ERROR_TYPE');
```

This error handling system provides a robust foundation for building reliable APIs with consistent error responses.
