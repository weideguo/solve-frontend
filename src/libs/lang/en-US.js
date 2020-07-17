const lang = {
    title: "SOLVE",
    loginTips: 'use chrome for best experience',
    exeinfoDemo: 
                 '# splite each line as execute target                    \n'+
                 '# demo:                                                 \n'+
                 '10.0.0.1  |  whoami  |  pwd                             \n'+
                 '10.0.0.2  |  who     |  date                            \n'+
                 '10.0.0.3  |  date    |  who                              ',
    playbookDemo: 
                  '# same as normal playbook                                          \n'+
                  '# but use _1 _2 _3 ... as paramster                                \n'+
                  '# demo:                                                            \n'+
                  '[{{_1}}]                                                           \n'+
                  'echo {{_2}}                                                        \n'+
                  'echo {{_3}}                                                          ',

}

export default lang;