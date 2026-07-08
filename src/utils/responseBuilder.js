const success = (
    message = "Success",
    data = null
) => {

    const response = {
        success: true,
        message
    };

    if (data !== null) {
        response.data = data;
    }

    return response;
};

const error = (
    message = "Internal Server Error",
    errors = null
) => {

    const response = {
        success: false,
        message
    };

    if (errors) {
        response.errors = errors;
    }

    return response;
};

module.exports = {
    success,
    error
};