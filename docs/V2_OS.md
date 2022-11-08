## Basic Structure
Kernel - very basic kernel that runs all processes

- Runs processes and traps any error from process
- Crashed processes are skipped and next process is run as normal
- Doesnot not suspend or limit runtime(yet)

Scheduler - basic scheduler

- FCFS 
- Has ready and completed queues
- No priority
- No sleep

Processes - basic process infrastructure

- Process Data is stored in memory for future runs.
- Can launch child processes.

# utils functions
These have been taken from https://github.com/Arcath/screeps-fns.git

A few more have been added

# Memory Layout
Memory is layed out at the moment in 3 parts

- Global Memory: Used by the entire program
- Room Memory: Used on the per room basis
- Creep Memory: Used on a per creep basis