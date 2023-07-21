#include <iostream>
#include <queue>
#include <functional>
using namespace std;

int main() {
    int n;
    cin >> n;

    priority_queue<int, vector<int>, less<int>> maxHeap;     // stores the smaller half of the elements
    priority_queue<int, vector<int>, greater<int>> minHeap;  // stores the larger half of the elements

    for (int i = 0; i < n; i++) {
        int num;
        cin >> num;

        if (maxHeap.empty() || num <= maxHeap.top()) {
            maxHeap.push(num);
        } else {
            minHeap.push(num);
        }

        // Balance the heaps
        if (maxHeap.size() > minHeap.size() + 1) {
            minHeap.push(maxHeap.top());
            maxHeap.pop();
        } else if (minHeap.size() > maxHeap.size()) {
            maxHeap.push(minHeap.top());
            minHeap.pop();
        }

        // Calculate and print the median
        if (maxHeap.size() > minHeap.size()) {
            cout << maxHeap.top() << endl;
        } else {
            cout << (maxHeap.top() + minHeap.top()) / 2 << endl;
        }
    }

    return 0;
}
