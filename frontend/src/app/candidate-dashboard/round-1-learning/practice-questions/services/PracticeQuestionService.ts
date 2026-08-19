import javaPracticeData from "../data/java/practice-questions.json";
import { PracticeData, Topic } from "../types/practice";
import { FlatTopic } from "../types/practice";

const SECTION_ORDER: readonly (keyof PracticeData)[] = [
    "collections",
    "exceptions",
    "multithreading",
    "equalsAndHashCode",
];

class PracticeQuestionService {

    // JSON module imports widen string literals. The content validation step
    // restricts every authored difficulty to Easy, Medium, or Hard.
    private data: PracticeData = javaPracticeData as unknown as PracticeData;

    getData() {
        return this.data;
    }

    getSections() {
        return [...SECTION_ORDER];
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

const practiceQuestionService = new PracticeQuestionService();

export default practiceQuestionService;
