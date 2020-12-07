#
# @reference
# https://raw.githubusercontent.com/madduci/docker-github-pages/master/Dockerfile
#
FROM alpine:latest

WORKDIR /site

RUN apk update && \
    apk --update add \
    gcc \
    g++ \
    make \
    curl \
    bison \
    ca-certificates \
    tzdata \
    ruby \
    ruby-rdoc \
    ruby-irb \
    ruby-bundler \
    ruby-nokogiri \
    ruby-dev \
    ruby-bigdecimal \
    ruby-webrick \
    glib-dev \
    zlib-dev \
    libc-dev && \
    echo 'gem: --no-document' > /etc/gemrc && \
    gem install github-pages --version 207 && \
    gem install jekyll-watch && \
    gem install jekyll-admin && \
    rm -rf /var/cache/apk/*
    # apk del gcc g++ binutils bison perl nodejs make curl && \

EXPOSE 8080

CMD ["bundle", "exec", "jekyll"]

# Do not use cache when we change node dependencies in package.json
COPY Gemfile Gemfile.lock ./

RUN bundle install

# ENTRYPOINT ["bundle"]
