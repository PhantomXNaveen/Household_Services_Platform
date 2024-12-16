class Config():
    DEBUG = False
    SQL_ALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = "shouldbekeyveryhidden"  # This should ideally be stored securely

class LocalDevelopmentConfig(Config):
    SQLALCHEMY_DATABASE_URI = "sqlite:///database.sqlite3"
    DEBUG = True

    # Flask-Security configurations
    SECURITY_PASSWORD_HASH = 'bcrypt'
    SECURITY_PASSWORD_SALT = 'thisshouldbekeptsecret'  # Store securely
    SECURITY_TOKEN_AUTHENTICATION_HEADER = 'Authentication-Token'
    SECURITY_TOKEN_MAX_AGE = 3600  # Token expiration time in seconds (e.g., 1 hour)
    # SECURITY_PASSWORD_MIN_LENGTH = 8  # Optional: Enforce stronger password policy

    # cache-specific
    CACHE_TYPE = "RedisCache"
    CACHE_DEFAULT_TIMEOUT = 30
    CACHE_REDIS_PORT = 6379

    # CSRF protection
    WTF_CSRF_ENABLED = False
