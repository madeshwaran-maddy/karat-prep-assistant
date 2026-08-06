import practiceData from "../data/practice-questions.json";
import { PracticeData, Topic } from "../types/practice";
import { FlatTopic } from "../types/practice";

class PracticeQuestionService {

    private data: PracticeData = practiceData;

    getData() {
        return this.data;
    }

    getSections() {
        return Object.keys(this.data) as (keyof PracticeData)[];
    }

    getTopics(section: keyof PracticeData): Topic[] {
        return this.data[section];
    }

    getTopic(
        section: keyof PracticeData,
        topicId: string
    ): Topic | undefined {

        return this.data[section].find(
            topic => topic.id === topicId
        );
    }

    getAllTopics(): FlatTopic[] {

    const topics: FlatTopic[] = [];

    this.getSections().forEach((section) => {

        this.data[section].forEach((topic) => {

            topics.push({
                section,
                topic
            });

        });

    });

    return topics;

}

getTopicPosition(
    section: keyof PracticeData,
    topicId: string
) {

    return this.getAllTopics().findIndex(
        item =>
            item.section === section &&
            item.topic.id === topicId
    );

}

getNextTopic(
    section: keyof PracticeData,
    topicId: string
) {

    const topics = this.getAllTopics();

    const index =
        this.getTopicPosition(section, topicId);

    if (index === topics.length - 1)
        return null;

    return topics[index + 1];

}

getPreviousTopic(
    section: keyof PracticeData,
    topicId: string
) {

    const topics = this.getAllTopics();

    const index =
        this.getTopicPosition(section, topicId);

    if (index <= 0)
        return null;

    return topics[index - 1];

}

}

export default new PracticeQuestionService();