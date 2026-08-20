import { FlatTopic, PracticeData } from "../types/practice";

export function flattenTopics(data: PracticeData): FlatTopic[] {
    const topics: FlatTopic[] = [];

    Object.keys(data).forEach((section) => {
        const list = data[section];
        list.forEach((topic) => {
            topics.push({
                section,
                topic,
            });
        });
    });

    return topics;
}

export function getTopicIndex(
    topics: FlatTopic[],
    section: string,
    topicId: string
): number {
    return topics.findIndex(
        (item) => item.section === section && item.topic.id === topicId
    );
}