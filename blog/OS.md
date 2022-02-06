The bot logic was becoming a spagetti mess and even small changes were causing bugs. The codebase is fairly small but needs reorganization. Around this point I learned about OS style bots in discord and it seems a lot of good players were using it. 
Basically the idea is to have various processes, a scheduler and a kernel and then make the logic around these. There is an excellent resource in the [wiki](https://wiki.screepspl.us/index.php/Operating_System). This system has a very nice logical separation which I really like. So I am looking to structure my bot like this.

