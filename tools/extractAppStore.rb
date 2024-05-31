require "spaceship"

def last_year
    time = Time.now
    past = time - (60 * 60 * 24 * 365)
    end_t   = time.strftime("%Y-%m-%dT00:00:00Z")
    start_t = past.strftime("%Y-%m-%dT00:00:00Z")

    return start_t, end_t
end

def last_14_days
    time = Time.now
    past = time - (60 * 60 * 24 * 14)
    end_t   = time.strftime("%Y-%m-%dT00:00:00Z")
    start_t = past.strftime("%Y-%m-%dT00:00:00Z")

    return start_t, end_t
end

Spaceship::Tunes.login("user@itunes.com") # TODO: Replace here

app = Spaceship::Tunes::Application.find("com.visikon.safedelivery")
# puts app.install_count

# Ratings
rating_count = app.ratings.rating_count
one_star_rating_count = app.ratings.one_star_rating_count
two_star_rating_count = app.ratings.two_star_rating_count
three_star_rating_count = app.ratings.three_star_rating_count
four_star_rating_count = app.ratings.four_star_rating_count
five_star_rating_count = app.ratings.five_star_rating_count

ratings = {
    :rating_count => rating_count,
    :one_star_rating_count => one_star_rating_count,
    :two_star_rating_count => two_star_rating_count,
    :three_star_rating_count => three_star_rating_count,
    :four_star_rating_count => four_star_rating_count,
    :five_star_rating_count => five_star_rating_count,
}

# Get hold of analytics
analytics = app.analytics
# puts analytics

#start_t, end_t = Spaceship::Tunes::AppAnalytics::time_last_30_days
# start_t, end_t = analytics.time_last_30_days
start_t, end_t = last_14_days

# Units
units = analytics.app_units_interval(start_t, end_t)

# Install counts
installs = analytics.app_installs_interval(start_t, end_t)        # => Array of dates representing raw data for each day

# Get app sessions
sessions = analytics.app_sessions_interval(start_t, end_t)        # => Array of dates representing raw data for each day

# Get active devices
devices = analytics.app_active_devices_interval(start_t, end_t)

result = {
   :units => units,
   :installs => installs,
   :sessions => sessions,
   :devices => devices,
   :ratings => ratings,
}
puts result.to_json


