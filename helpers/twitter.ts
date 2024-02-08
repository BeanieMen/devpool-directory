import { TweetV2, TwitterApi } from "twitter-api-v2";
import dotenv from "dotenv";
dotenv.config();

// Check for each environment variable
const apiKey = process.env.TWITTER_API_KEY;
const apiKeySecret = process.env.TWITTER_API_KEY_SECRET;
const accessToken = process.env.TWITTER_ACCESS_TOKEN;
const accessTokenSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET;

if (!apiKey || !apiKeySecret || !accessToken || !accessTokenSecret) {
  throw new Error("Twitter environment variables are not set");
}

const twitterClient = new TwitterApi({
  appKey: apiKey,
  appSecret: apiKeySecret,
  accessToken: accessToken,
  accessSecret: accessTokenSecret,
});

async function postTweet(status: string) {
  try {
    const { data } = await twitterClient.v2.tweet(status);
    console.log(`Tweet posted successfully, id: ${data.id}, text: ${data.text}`);
  } catch (error) {
    console.error("Error posting tweet", error);
  }
}
async function getAllTweets(userId: string) {
  const tweets: TweetV2[] = [];

  try {
    let { data } = await twitterClient.v2.userTimeline(userId, { max_results: 100 });
    tweets.push(...data.data);
    while (data.meta.next_token) {
      data = (await twitterClient.v2.userTimeline(userId, { pagination_token: data.meta.next_token })).data;
      tweets.push(...data.data);
    }
    console.log(`successfully fetched all tweets for, id: ${userId}`);
    return tweets;
  } catch (error) {
    console.error("Error fetching all tweets", error);
  }
}

async function deleteTweet(id: string) {
  try {
    const { data } = await twitterClient.v2.deleteTweet(id);
    if (data.deleted) {
      console.log(`Successfully deleted tweet, id: ${id}`);
    } else {
      console.log(`Couldnt delete tweet, id ${id}`);
    }
  } catch (error) {
    console.error("Error deleting tweet", error);
  }
}

async function deleteTweetByQuery(body: string) {
  const userId = (await twitterClient.currentUserV2()).data.id;
  try {
    const tweets = await getAllTweets(userId);
    const tweet = tweets?.filter((v) => v.text == body);
    if (tweet) {
      await deleteTweet(tweet[0].id);
    }
  } catch (error) {
    console.error("Error deleting tweet", error);
  }
}

export default {
  postTweet,
  deleteTweet,
  getAllTweets,
  deleteTweetByQuery,
  client: twitterClient,
};
