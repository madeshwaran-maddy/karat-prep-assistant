import javaPracticeData from "../data/java/practice-questions.json";
import nodePracticeData from "../data/node/practice-questions.json";
import { SupportedLanguage } from "../../../../../config/languages";
import { PracticeData, Topic } from "../types/practice";
import { FlatTopic } from "../types/practice";

function normalizePracticeData(rawData: Record<string, unknown>): PracticeData {
    return Object.fromEntries(
        Object.entries(rawData).map(([section, entries]) => {
            const topics = Array.isArray(entries)
                ? entries.flatMap((entry) => {
                    if (!entry || typeof entry !== "object") {
                        return [];
                    }

                    const item = entry as Record<string, unknown>;
                    if (Array.isArray(item.questions)) {
                        return [item as unknown as Topic];
                    }

                    if (Array.isArray(item.subtopics)) {
                        return item.subtopics.filter(
                            (subtopic): subtopic is Topic =>
                                Boolean(subtopic) &&
                                typeof subtopic === "object" &&
                                Array.isArray((subtopic as Record<string, unknown>).questions)
                        );
                    }

                    return [];
                })
                : [];

            return [section, topics as Topic[]];
        })
    ) as PracticeData;
}

class PracticeQuestionService {

    // JSON module imports widen string literals. The content validation step
    // restricts every authored difficulty to Easy, Medium, or Hard.
    private readonly dataByLanguage: Record<SupportedLanguage, PracticeData> = {
        java: normalizePracticeData(javaPracticeData as unknown as Record<string, unknown>),
        node: normalizePracticeData(nodePracticeData as unknown as Record<string, unknown>),
    };

    getData(languageId: SupportedLanguage = "java") {
        return this.dataByLanguage[languageId];
    }

    getSections() {
        return Object.keys(this.dataByLanguage.java);
    }

    getTopics(section: string, languageId: SupportedLanguage = "java"): Topic[] {
        return this.getData(languageId)[section];
    }

    getTopic(
        section: string,
        topicId: string,
        languageId: SupportedLanguage = "java"
    ): Topic | undefined {

        return this.getData(languageId)[section].find(
            topic => topic.id === topicId
        );
    }

    getAllTopics(languageId: SupportedLanguage = "java"): FlatTopic[] {

    const topics: FlatTopic[] = [];

    Object.keys(this.getData(languageId)).forEach((section) => {

        this.getData(languageId)[section].forEach((topic) => {

            topics.push({
                section,
                topic
            });

        });

    });

    return topics;

}

getTopicPosition(
    section: string,
    topicId: string,
    languageId: SupportedLanguage = "java"
) {

    return this.getAllTopics(languageId).findIndex(
        item =>
            item.section === section &&
            item.topic.id === topicId
    );

}

    getNextTopic(
    section: string,
    topicId: string,
    languageId: SupportedLanguage = "java"
) {

    const topics = this.getAllTopics(languageId);

    const index =
        this.getTopicPosition(section, topicId, languageId);

    if (index === topics.length - 1)
        return null;

    return topics[index + 1];

}

getPreviousTopic(
    section: string,
    topicId: string,
    languageId: SupportedLanguage = "java"
) {

    const topics = this.getAllTopics(languageId);

    const index =
        this.getTopicPosition(section, topicId, languageId);

    if (index <= 0)
        return null;

    return topics[index - 1];

}

}

const practiceQuestionService = new PracticeQuestionService();

export default practiceQuestionService;
