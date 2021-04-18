#include <iostream>
#include <vector>
using namespace std;

int main(){
    int num[3]; cin >> num[0] >> num[1] >> num[2];
    int n; cin >> n;
    int ans = 0;
    vector<vector<int>> nMulti(3, vector<int>(0));
    for(int i = 0; i < 3; i++){
        int res = n;
        while(res >= num[i]){
            nMulti[i].push_back(res);
            res += n;
        }
    }
    cout << nMulti[0].size() * nMulti[1].size() * nMulti[2].size() << endl;
}